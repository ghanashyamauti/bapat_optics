from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import Appointment, User
from app.schemas.schemas import AppointmentCreate, AppointmentUpdateStatus, AppointmentResponse
from app.api.deps import get_current_active_admin
from app.core.email_service import send_appointment_confirmation_email

router = APIRouter(prefix="/appointments", tags=["Eye Test Clinic Appointments"])

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(
    appointment_in: AppointmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    if db.query(Appointment).filter(
        Appointment.branch == appointment_in.branch,
        Appointment.appointment_date == appointment_in.appointment_date,
        Appointment.time_slot == appointment_in.time_slot,
        Appointment.status.in_(["PENDING", "CONFIRMED"]),
    ).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That clinic slot is already booked")
    new_appointment = Appointment(
        customer_name=appointment_in.customer_name,
        customer_phone=appointment_in.customer_phone,
        customer_email=appointment_in.customer_email,
        branch=appointment_in.branch,
        appointment_date=appointment_in.appointment_date,
        time_slot=appointment_in.time_slot,
        test_type=appointment_in.test_type or "Zeiss 3D Digital Wavefront Examination",
        status="CONFIRMED",
        notes=appointment_in.notes
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    # Send automated email confirmation if customer email is provided
    if new_appointment.customer_email:
        background_tasks.add_task(send_appointment_confirmation_email, new_appointment)

    return new_appointment

@router.get("", response_model=List[AppointmentResponse])
def list_appointments(
    db: Session = Depends(get_db),
    branch: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(Appointment)
    if branch:
        query = query.filter(Appointment.branch.ilike(f"%{branch}%"))
    if status_filter:
        query = query.filter(Appointment.status == status_filter.upper())
        
    return query.order_by(desc(Appointment.created_at)).all()

@router.put("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: str,
    status_in: AppointmentUpdateStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    apt.status = status_in.status.upper()
    if status_in.notes:
        apt.notes = status_in.notes
        
    db.commit()
    db.refresh(apt)
    return apt
