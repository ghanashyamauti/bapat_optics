from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH & USER SCHEMAS -----------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str
    email: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserChangePassword(BaseModel):
    old_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=6, max_length=128)

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- CATEGORY SCHEMAS -----------------

class CategoryBase(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True


# ----------------- BRAND SCHEMAS -----------------

class BrandBase(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None
    is_luxury: Optional[bool] = False
    is_active: Optional[bool] = True

class BrandCreate(BrandBase):
    pass

class BrandResponse(BrandBase):
    id: str

    class Config:
        from_attributes = True


# ----------------- PRODUCT SCHEMAS -----------------

class ProductImageSchema(BaseModel):
    id: Optional[str] = None
    image_url: str
    alt_text: Optional[str] = None
    is_primary: Optional[bool] = False
    sort_order: Optional[int] = 0

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str
    name: str
    brand_id: str
    category_id: str
    gender: Optional[str] = "UNISEX"
    material: Optional[str] = "ACETATE"
    frame_type: Optional[str] = "FULL FRAME"
    colour: Optional[str] = "SOLID BLACK"
    frame_shape: Optional[str] = "WAYFARER"
    price: float
    sale_price: Optional[float] = None
    stock_quantity: Optional[int] = 10
    branch_stock: Optional[Dict[str, int]] = None
    lens_width: Optional[int] = 53
    bridge_width: Optional[int] = 18
    temple_length: Optional[int] = 140
    dimensions_str: Optional[str] = "53-18-140"
    description: Optional[str] = None
    primary_image: str
    secondary_image: Optional[str] = None
    video_url: Optional[str] = None
    is_featured: Optional[bool] = False
    is_bestseller: Optional[bool] = False
    is_active: Optional[bool] = True

class ProductCreate(ProductBase):
    additional_images: Optional[List[str]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand_id: Optional[str] = None
    category_id: Optional[str] = None
    gender: Optional[str] = None
    material: Optional[str] = None
    frame_type: Optional[str] = None
    colour: Optional[str] = None
    frame_shape: Optional[str] = None
    price: Optional[float] = None
    sale_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    lens_width: Optional[int] = None
    bridge_width: Optional[int] = None
    temple_length: Optional[int] = None
    dimensions_str: Optional[str] = None
    description: Optional[str] = None
    primary_image: Optional[str] = None
    secondary_image: Optional[str] = None
    video_url: Optional[str] = None
    additional_images: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    brand: Optional[BrandResponse] = None
    category: Optional[CategoryResponse] = None
    images: Optional[List[ProductImageSchema]] = []

    class Config:
        from_attributes = True

class PaginatedProductsResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ----------------- MASTER FILTERS RESPONSE -----------------

class FilterAttributeOption(BaseModel):
    label: str
    value: str
    count: int
    hex_color: Optional[str] = None
    icon: Optional[str] = None

class MasterFiltersResponse(BaseModel):
    categories: List[FilterAttributeOption]
    genders: List[FilterAttributeOption]
    materials: List[FilterAttributeOption]
    frame_types: List[FilterAttributeOption]
    colours: List[FilterAttributeOption]
    brands: List[FilterAttributeOption]
    frame_shapes: List[FilterAttributeOption]
    min_price: float
    max_price: float


# ----------------- INQUIRY / CRM LEADS SCHEMAS -----------------

class InquiryCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    product_id: Optional[str] = None
    inquiry_type: Optional[str] = "WHATSAPP_TRYON"
    branch_preference: Optional[str] = "Kothrud ZEISS Center"
    message: Optional[str] = None
    prescription_url: Optional[str] = None

class InquiryUpdateStatus(BaseModel):
    status: str # NEW, CONTACTED, TRIAL_BOOKED, CONVERTED, CLOSED
    notes: Optional[str] = None

class InquiryResponse(InquiryCreate):
    id: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


# ----------------- ORDER & CHECKOUT SCHEMAS -----------------

class OrderItemCreate(BaseModel):
    product_id: str
    product_name: str
    product_sku: str
    product_image: Optional[str] = None
    unit_price: float
    quantity: int = 1
    lens_type: Optional[str] = "FRAME_ONLY"
    lens_price: Optional[float] = 0.0

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    delivery_type: str = "HOME_DELIVERY" # HOME_DELIVERY, STORE_PICKUP
    store_pickup_branch: Optional[str] = None
    shipping_address: Optional[str] = None
    city: Optional[str] = "Pune"
    pincode: Optional[str] = None
    state: Optional[str] = "Maharashtra"
    lens_selection_type: Optional[str] = "FRAME_ONLY"
    prescription_data: Optional[str] = None
    prescription_file_url: Optional[str] = None
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class OrderItemResponse(OrderItemCreate):
    id: str
    total_price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: str
    delivery_type: str
    store_pickup_branch: Optional[str] = None
    shipping_address: Optional[str] = None
    city: str
    pincode: Optional[str] = None
    state: str
    lens_selection_type: str
    prescription_data: Optional[str] = None
    prescription_file_url: Optional[str] = None
    subtotal_amount: float
    tax_amount: float = 0.0
    shipping_amount: float = 0.0
    discount_amount: float
    total_amount: float
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    payment_status: str
    order_status: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# ----------------- APPOINTMENT SCHEMAS -----------------

class AppointmentCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    branch: str = "Kothrud ZEISS Center"
    appointment_date: str
    time_slot: str
    test_type: Optional[str] = "Zeiss 3D Digital Wavefront Examination"
    notes: Optional[str] = None

class AppointmentUpdateStatus(BaseModel):
    status: str # PENDING, CONFIRMED, COMPLETED, CANCELLED
    notes: Optional[str] = None

class AppointmentResponse(AppointmentCreate):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- CRM EXECUTIVE DASHBOARD STATS -----------------

class CRMStatsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    pending_orders: int
    paid_orders: int
    total_leads: int
    new_leads: int
    converted_leads: int
    total_appointments: int
    pending_appointments: int
    total_products: int
    out_of_stock_products: int
    recent_inquiries: List[InquiryResponse]
    recent_orders: List[OrderResponse]
    recent_appointments: List[AppointmentResponse]
