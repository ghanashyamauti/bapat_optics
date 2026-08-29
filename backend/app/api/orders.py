import time
import hmac
import hashlib
import random
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks, Response
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Order, OrderItem, Product, User
from app.schemas.schemas import (
    OrderCreate, VerifyPaymentRequest, OrderResponse
)
from app.api.deps import get_current_user, get_current_active_admin
from app.core.email_service import send_order_confirmation_email
from app.core.pdf_invoice import generate_invoice_pdf

router = APIRouter(prefix="/orders", tags=["Orders & Razorpay Checkout"])

def generate_order_number():
    ts = time.strftime("%Y%m%d")
    rand_suffix = f"{random.randint(1000, 9999)}"
    return f"BPT-{ts}-{rand_suffix}"

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in is required before checkout")
    if not order_in.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least 1 item")

    # Re-price AND atomically reserve stock; never trust prices from the browser.
    subtotal = 0.0
    reserved_products = []  # track (product, qty) so we can restore on failure
    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.is_active == True).with_for_update().first()
        if not product:
            # Restore already-reserved stock before raising
            for p, q in reserved_products:
                p.stock_quantity += q
            db.flush()
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is unavailable")
        if product.stock_quantity <= 0 or item.quantity > product.stock_quantity:
            for p, q in reserved_products:
                p.stock_quantity += q
            db.flush()
            raise HTTPException(status_code=409, detail=f"Only {product.stock_quantity} unit(s) available for '{product.name}'")
        catalog_price = product.sale_price if product.sale_price is not None else product.price
        subtotal += (catalog_price + (item.lens_price or 0.0)) * item.quantity
        # Reserve stock immediately so concurrent requests can't double-sell
        product.stock_quantity -= item.quantity
        reserved_products.append((product, item.quantity))
    discount = 0.0
    tax = round((subtotal - discount) * settings.GST_PERCENT / 100, 2)
    shipping = 0.0 if order_in.delivery_type == "STORE_PICKUP" or subtotal >= settings.FREE_SHIPPING_THRESHOLD else settings.SHIPPING_FLAT_RATE
    total = subtotal - discount + tax + shipping
    order_num = generate_order_number()

    # Create dummy/real Razorpay Order ID
    razorpay_order_id = f"order_{int(time.time())}_{random.randint(100, 999)}"
    
    try:
        if settings.RAZORPAY_KEY_ID and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_Bapat"):
            import razorpay
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            rp_order = client.order.create({
                "amount": int(total * 100), # Amount in paise
                "currency": settings.RAZORPAY_CURRENCY,
                "receipt": order_num,
                "payment_capture": 1
            })
            razorpay_order_id = rp_order["id"]
    except Exception as e:
        # Fallback to simulated razorpay order id for development / testing
        pass

    new_order = Order(
        order_number=order_num,
        user_id=current_user.id if current_user else None,
        customer_name=order_in.customer_name,
        customer_phone=order_in.customer_phone,
        customer_email=order_in.customer_email,
        delivery_type=order_in.delivery_type,
        store_pickup_branch=order_in.store_pickup_branch,
        shipping_address=order_in.shipping_address,
        city=order_in.city or "Pune",
        pincode=order_in.pincode,
        state=order_in.state or "Maharashtra",
        lens_selection_type=order_in.lens_selection_type or "FRAME_ONLY",
        prescription_data=order_in.prescription_data,
        prescription_file_url=order_in.prescription_file_url,
        subtotal_amount=subtotal,
        tax_amount=tax,
        shipping_amount=shipping,
        discount_amount=discount,
        total_amount=total,
        razorpay_order_id=razorpay_order_id,
        payment_status="PENDING",
        order_status="PENDING",
        notes=order_in.notes
    )
    db.add(new_order)
    db.flush()

    for item in order_in.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_sku=item.product_sku,
            product_image=item.product_image,
            unit_price=item.unit_price,
            quantity=item.quantity,
            lens_type=item.lens_type or "FRAME_ONLY",
            lens_price=item.lens_price or 0.0,
            total_price=(item.unit_price + (item.lens_price or 0.0)) * item.quantity
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)

    return {
        "order_id": new_order.id,
        "order_number": new_order.order_number,
        "amount": new_order.total_amount,
        "currency": "INR",
        "razorpay_order_id": razorpay_order_id,
        "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        "customer_name": new_order.customer_name,
        "customer_email": new_order.customer_email,
        "customer_phone": new_order.customer_phone
    }

@router.post("/verify-payment", response_model=dict)
def verify_payment(
    verify_data: VerifyPaymentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == verify_data.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # In test/demo mode or live mode
    is_valid = settings.MOCK_PAYMENTS
    if settings.RAZORPAY_KEY_SECRET and not settings.MOCK_PAYMENTS:
        try:
            msg = f"{verify_data.razorpay_order_id}|{verify_data.razorpay_payment_id}"
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                msg.encode(),
                hashlib.sha256
            ).hexdigest()
            is_valid = hmac.compare_digest(generated_signature, verify_data.razorpay_signature)
        except Exception:
            is_valid = False

    # Restoration and status update handled below after the early-return check

    if order.payment_status == "PAID":
        # Idempotent: payment already confirmed, just re-send email
        background_tasks.add_task(send_order_confirmation_email, order)
        return {"status": "success", "message": "Payment already verified", "order_number": order.order_number, "payment_id": order.razorpay_payment_id}

    # Stock was already decremented at order creation.
    # On payment failure, restore the reserved stock.
    if not is_valid:
        for item in order.items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if product:
                    product.stock_quantity += item.quantity
        order.payment_status = "FAILED"
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment signature verification failed")

    order.payment_status = "PAID"
    order.order_status = "PROCESSING"
    order.razorpay_payment_id = verify_data.razorpay_payment_id
    order.razorpay_signature = verify_data.razorpay_signature
    db.commit()
    db.refresh(order)

    # Trigger Automated Confirmation Email with PDF invoice attached
    background_tasks.add_task(send_order_confirmation_email, order)

    return {
        "status": "success",
        "message": "Payment verified successfully",
        "order_number": order.order_number,
        "payment_id": verify_data.razorpay_payment_id
    }

@router.get("/invoice/{order_id}")
@router.get("/{order_id}/invoice")
def get_order_invoice_pdf(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates and returns the official Tax Invoice PDF for an order.
    Requires authentication; customers can only fetch their own invoices.
    Admins can fetch any invoice.
    """
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required to download invoices")

    order = db.query(Order).options(joinedload(Order.items)).filter(
        (Order.id == order_id) | (Order.order_number == order_id)
    ).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Customers can only access their own invoices; admins/optometrists can access any
    is_admin = current_user.role in ("ADMIN", "OPTOMETRIST")
    is_owner = (
        order.user_id == current_user.id or
        order.customer_email == current_user.email
    )
    if not is_admin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to access this invoice")

    try:
        pdf_bytes = generate_invoice_pdf(order)
        filename = f"Invoice_{order.order_number}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate invoice PDF: {str(e)}")

@router.get("", response_model=List[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(Order).options(joinedload(Order.items))
    if status_filter:
        query = query.filter(Order.order_status == status_filter.upper())
    
    orders = query.order_by(desc(Order.created_at)).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    order = db.query(Order).options(joinedload(Order.items)).filter(
        (Order.id == order_id) | (Order.order_number == order_id)
    ).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    # Customers can only view their own orders
    is_admin = current_user.role in ("ADMIN", "OPTOMETRIST")
    is_owner = (order.user_id == current_user.id or order.customer_email == current_user.email)
    if not is_admin and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return order

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    new_status: str = Query(..., description="PENDING, PROCESSING, READY_FOR_PICKUP, SHIPPED, DELIVERED, CANCELLED"),
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    old_status = order.order_status
    target_status = new_status.upper()
    order.order_status = target_status

    # If cancelling an active order, restore product inventory
    if target_status == "CANCELLED" and old_status != "CANCELLED":
        for item in order.items:
            if item.product_id:
                p = db.query(Product).filter(Product.id == item.product_id).first()
                if p:
                    p.stock_quantity += item.quantity

    db.commit()
    db.refresh(order)
    return order


