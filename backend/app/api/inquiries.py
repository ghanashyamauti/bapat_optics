import urllib.parse
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Inquiry, Product, User
from app.schemas.schemas import InquiryCreate, InquiryUpdateStatus, InquiryResponse
from app.api.deps import get_current_active_admin

router = APIRouter(prefix="/inquiries", tags=["Inquiries & CRM Leads"])

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_inquiry(inquiry_in: InquiryCreate, db: Session = Depends(get_db)):
    product = None
    product_details = ""
    if inquiry_in.product_id:
        product = db.query(Product).filter(Product.id == inquiry_in.product_id).first()
        if product:
            product_details = f"Frame: {product.name} (SKU: {product.sku}) | Price: ₹{product.price:,.0f} | Dimensions: {product.dimensions_str}"

    new_inquiry = Inquiry(
        customer_name=inquiry_in.customer_name,
        customer_phone=inquiry_in.customer_phone,
        customer_email=inquiry_in.customer_email,
        product_id=inquiry_in.product_id,
        inquiry_type=inquiry_in.inquiry_type or "WHATSAPP_TRYON",
        branch_preference=inquiry_in.branch_preference or "Kothrud ZEISS Center",
        message=inquiry_in.message,
        prescription_url=inquiry_in.prescription_url,
        status="NEW"
    )
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)

    # Format WhatsApp URL with luxury concierge greeting
    phone_clean = settings.BAPAT_WHATSAPP_NUMBER.replace("+", "").replace(" ", "").replace("-", "")
    message_lines = [
        "Namaste Bapat Optics Pune! 🙏",
        f"I would like to enquire / book a try-on for:",
        f"• Customer Name: {inquiry_in.customer_name}",
        f"• Phone: {inquiry_in.customer_phone}",
        f"• Preferred Branch: {inquiry_in.branch_preference}",
    ]
    if product_details:
        message_lines.append(f"• {product_details}")
    if inquiry_in.message:
        message_lines.append(f"• Note: {inquiry_in.message}")
    message_lines.append("Please confirm trial availability and timings.")

    whatsapp_text = "\n".join(message_lines)
    encoded_text = urllib.parse.quote(whatsapp_text)
    whatsapp_url = f"https://wa.me/{phone_clean}?text={encoded_text}"

    return {
        "id": new_inquiry.id,
        "status": "success",
        "message": "Inquiry registered in Bapat Optics CRM",
        "whatsapp_url": whatsapp_url
    }

@router.get("", response_model=List[InquiryResponse])
def list_inquiries(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(None, description="NEW, CONTACTED, TRIAL_BOOKED, CONVERTED, CLOSED"),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(Inquiry).options(
        joinedload(Inquiry.product).joinedload(Product.brand)
    )
    if status_filter:
        query = query.filter(Inquiry.status == status_filter.upper())
    
    inquiries = query.order_by(desc(Inquiry.created_at)).all()
    return inquiries

@router.put("/{inquiry_id}/status", response_model=InquiryResponse)
def update_inquiry_status(
    inquiry_id: str,
    status_in: InquiryUpdateStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry lead not found")
    
    inquiry.status = status_in.status.upper()
    if status_in.notes:
        inquiry.notes = status_in.notes
    
    db.commit()
    db.refresh(inquiry)
    return inquiry
