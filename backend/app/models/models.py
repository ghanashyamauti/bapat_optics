import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="CUSTOMER", nullable=False) # CUSTOMER, ADMIN, OPTOMETRIST
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    icon = Column(String(100), nullable=True) # e.g. "Glasses", "Sun", "Eye", etc.
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    products = relationship("Product", back_populates="category")


class Brand(Base):
    __tablename__ = "brands"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), unique=True, nullable=False)
    slug = Column(String(150), unique=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    is_luxury = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    products = relationship("Product", back_populates="brand")


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    
    brand_id = Column(String(36), ForeignKey("brands.id"), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=False)
    
    gender = Column(String(50), default="UNISEX", index=True) # KIDS, UNISEX, MEN, WOMEN
    material = Column(String(100), default="ACETATE", index=True)
    frame_type = Column(String(50), default="FULL FRAME", index=True) # FULL FRAME, SUPRA, RIMLESS, MFULL
    colour = Column(String(100), default="SOLID BLACK", index=True)
    frame_shape = Column(String(100), default="WAYFARER", index=True) # HEXAGON, SQUARE, WAYFARER, CAT EYE, OVAL, ROUND, AVIATOR, HEXAGONE
    
    price = Column(Float, nullable=False)
    sale_price = Column(Float, nullable=True)
    stock_quantity = Column(Integer, default=10)
    branch_stock = Column(JSON, default=lambda: {"Kothrud ZEISS Center": 0, "Sadashiv Peth": 0})
    
    # Frame Dimensions
    lens_width = Column(Integer, default=53) # mm
    bridge_width = Column(Integer, default=18) # mm
    temple_length = Column(Integer, default=140) # mm
    dimensions_str = Column(String(50), default="53-18-140")
    
    description = Column(Text, nullable=True)
    primary_image = Column(String(1000), nullable=False)
    secondary_image = Column(String(1000), nullable=True)
    video_url = Column(String(1000), nullable=True)
    
    is_featured = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    inquiries = relationship("Inquiry", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    image_url = Column(String(1000), nullable=False)
    alt_text = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    inquiry_type = Column(String(50), default="WHATSAPP_TRYON") # WHATSAPP_TRYON, GENERAL_INQUIRY, PRICE_REQUEST, HOME_TRIAL
    branch_preference = Column(String(100), default="Kothrud ZEISS Center") # Kothrud ZEISS Center, Sadashiv Peth
    
    message = Column(Text, nullable=True)
    prescription_url = Column(String(1000), nullable=True)
    status = Column(String(50), default="NEW") # NEW, CONTACTED, TRIAL_BOOKED, CONVERTED, CLOSED
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="inquiries")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=False)
    
    delivery_type = Column(String(50), default="HOME_DELIVERY") # HOME_DELIVERY, STORE_PICKUP
    store_pickup_branch = Column(String(100), nullable=True)
    
    shipping_address = Column(Text, nullable=True)
    city = Column(String(100), default="Pune")
    pincode = Column(String(20), nullable=True)
    state = Column(String(100), default="Maharashtra")
    
    lens_selection_type = Column(String(100), default="FRAME_ONLY") # FRAME_ONLY, SINGLE_VISION_CLEAR, SINGLE_VISION_BLUEBLOCK, ZEISS_PHOTOFUSION_X, ZEISS_SMARTLIFE_PROGRESSIVE
    prescription_data = Column(Text, nullable=True) # JSON or text specs
    prescription_file_url = Column(String(1000), nullable=True)
    
    subtotal_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    shipping_amount = Column(Float, default=0.0, nullable=False)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    razorpay_order_id = Column(String(100), nullable=True, index=True)
    razorpay_payment_id = Column(String(100), nullable=True, index=True)
    razorpay_signature = Column(String(255), nullable=True)
    
    payment_status = Column(String(50), default="PENDING") # PENDING, PAID, FAILED, REFUNDED
    order_status = Column(String(50), default="PENDING") # PENDING, PROCESSING, READY_FOR_PICKUP, SHIPPED, DELIVERED, CANCELLED
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=False)
    product_image = Column(String(1000), nullable=True)
    
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    lens_type = Column(String(100), nullable=True)
    lens_price = Column(Float, default=0.0)
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    
    branch = Column(String(100), default="Kothrud ZEISS Center") # Kothrud ZEISS Center, Sadashiv Peth
    appointment_date = Column(String(50), nullable=False) # YYYY-MM-DD
    time_slot = Column(String(50), nullable=False) # e.g. "11:00 AM - 12:00 PM"
    test_type = Column(String(150), default="Zeiss 3D Digital Wavefront Examination")
    
    status = Column(String(50), default="PENDING") # PENDING, CONFIRMED, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
