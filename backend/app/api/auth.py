from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, Order, Appointment
from app.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    UserUpdateProfile, UserChangePassword, OrderResponse, AppointmentResponse
)
from app.api.deps import get_current_user, get_current_active_admin
from typing import List
from sqlalchemy.orm import joinedload
from sqlalchemy import desc

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account with this email address already exists"
        )
    
    new_user = User(
        email=user_in.email.lower(),
        phone=user_in.phone,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        # Public registration can never create privileged accounts.
        role="CUSTOMER",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(
        subject=new_user.id,
        extra_claims={"role": new_user.role, "email": new_user.email, "full_name": new_user.full_name}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.role,
        "user_id": new_user.id,
        "full_name": new_user.full_name,
        "email": new_user.email,
        "phone": new_user.phone
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated. Please contact Bapat Optics support."
        )
    
    access_token = create_access_token(
        subject=user.id,
        extra_claims={"role": user.role, "email": user.email, "full_name": user.full_name}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdateProfile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    if profile_data.full_name is not None and profile_data.full_name.strip():
        current_user.full_name = profile_data.full_name.strip()
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone.strip()
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password")
def change_password(
    pwd_data: UserChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    if not verify_password(pwd_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"status": "success", "message": "Password changed successfully"}

@router.get("/me/orders", response_model=List[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    orders = db.query(Order).options(joinedload(Order.items)).filter(
        (Order.user_id == current_user.id) | (Order.customer_email == current_user.email)
    ).order_by(desc(Order.created_at)).all()
    return orders

@router.get("/me/appointments", response_model=List[AppointmentResponse])
def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    appointments = db.query(Appointment).filter(
        (Appointment.customer_email == current_user.email) | 
        ((Appointment.customer_phone == current_user.phone) if current_user.phone else False)
    ).order_by(desc(Appointment.created_at)).all()
    return appointments

@router.get("/customers", response_model=List[UserResponse])
def list_customers(db: Session = Depends(get_db), _: User = Depends(get_current_active_admin)):
    return db.query(User).filter(User.role == "CUSTOMER").order_by(User.created_at.desc()).all()
