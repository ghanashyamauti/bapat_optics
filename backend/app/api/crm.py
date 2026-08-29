from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models.models import Order, Inquiry, Appointment, Product, User
from app.schemas.schemas import CRMStatsResponse
from app.api.deps import get_current_active_admin

router = APIRouter(prefix="/crm", tags=["Executive CRM Dashboard"])

@router.get("/stats", response_model=CRMStatsResponse)
def get_crm_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    # Revenue
    revenue_res = db.query(func.sum(Order.total_amount)).filter(Order.payment_status == "PAID").scalar()
    total_revenue = float(revenue_res) if revenue_res else 0.0

    # Orders
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(Order.order_status.in_(["PENDING", "PROCESSING"])).scalar() or 0
    paid_orders = db.query(func.count(Order.id)).filter(Order.payment_status == "PAID").scalar() or 0

    # Leads
    total_leads = db.query(func.count(Inquiry.id)).scalar() or 0
    new_leads = db.query(func.count(Inquiry.id)).filter(Inquiry.status == "NEW").scalar() or 0
    converted_leads = db.query(func.count(Inquiry.id)).filter(Inquiry.status == "CONVERTED").scalar() or 0

    # Appointments
    total_appointments = db.query(func.count(Appointment.id)).scalar() or 0
    pending_appointments = db.query(func.count(Appointment.id)).filter(Appointment.status == "PENDING").scalar() or 0

    # Products
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0
    out_of_stock = db.query(func.count(Product.id)).filter(Product.is_active == True, Product.stock_quantity <= 0).scalar() or 0

    # Recent lists
    recent_inquiries = db.query(Inquiry).options(
        joinedload(Inquiry.product)
    ).order_by(desc(Inquiry.created_at)).limit(6).all()

    recent_orders = db.query(Order).options(
        joinedload(Order.items)
    ).order_by(desc(Order.created_at)).limit(6).all()

    recent_appointments = db.query(Appointment).order_by(desc(Appointment.created_at)).limit(6).all()

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "paid_orders": paid_orders,
        "total_leads": total_leads,
        "new_leads": new_leads,
        "converted_leads": converted_leads,
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "total_products": total_products,
        "out_of_stock_products": out_of_stock,
        "recent_inquiries": recent_inquiries,
        "recent_orders": recent_orders,
        "recent_appointments": recent_appointments
    }

@router.get("/customers")
def get_crm_customers_history(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    customers = db.query(User).filter(User.role == "CUSTOMER").order_by(desc(User.created_at)).all()
    results = []
    for c in customers:
        orders = db.query(Order).options(joinedload(Order.items)).filter(
            (Order.user_id == c.id) | (Order.customer_email == c.email)
        ).order_by(desc(Order.created_at)).all()

        total_spent = sum(o.total_amount for o in orders if o.payment_status == "PAID")

        inquiries = db.query(Inquiry).filter(
            (Inquiry.customer_phone == c.phone) | (Inquiry.customer_name == c.full_name)
        ).order_by(desc(Inquiry.created_at)).all() if c.phone else []

        appointments = db.query(Appointment).filter(
            (Appointment.customer_email == c.email) | (Appointment.customer_phone == c.phone)
        ).order_by(desc(Appointment.created_at)).all()

        results.append({
            "id": c.id,
            "full_name": c.full_name,
            "email": c.email,
            "phone": c.phone or "N/A",
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "total_orders": len(orders),
            "total_spent": total_spent,
            "orders": [
                {
                    "id": o.id,
                    "order_number": o.order_number,
                    "total_amount": o.total_amount,
                    "payment_status": o.payment_status,
                    "order_status": o.order_status,
                    "delivery_type": o.delivery_type,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                    "items": [
                        {
                            "product_name": it.product_name,
                            "product_sku": it.product_sku,
                            "quantity": it.quantity,
                            "lens_type": it.lens_type,
                            "total_price": it.total_price
                        } for it in o.items
                    ]
                } for o in orders
            ],
            "inquiries_count": len(inquiries),
            "appointments_count": len(appointments)
        })
    return results
