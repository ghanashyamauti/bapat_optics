import math
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, asc

from app.core.database import get_db
from app.models.models import Product, Brand, Category, ProductImage, User
from app.schemas.schemas import (
    ProductCreate, ProductUpdate, ProductResponse, PaginatedProductsResponse
)
from app.api.deps import get_current_active_admin

router = APIRouter(prefix="/products", tags=["Products & Catalog"])

@router.get("", response_model=PaginatedProductsResponse)
def list_products(
    db: Session = Depends(get_db),
    categories: Optional[str] = Query(None, description="Comma-separated category slugs or names"),
    brands: Optional[str] = Query(None, description="Comma-separated brand slugs or names"),
    genders: Optional[str] = Query(None, description="Comma-separated genders (MEN, WOMEN, UNISEX, KIDS)"),
    materials: Optional[str] = Query(None, description="Comma-separated materials (ACETATE, TITANIUM, etc)"),
    frame_types: Optional[str] = Query(None, description="Comma-separated frame types (FULL FRAME, SUPRA, RIMLESS, MFULL)"),
    colours: Optional[str] = Query(None, description="Comma-separated colour names"),
    frame_shapes: Optional[str] = Query(None, description="Comma-separated frame shapes (AVIATOR, ROUND, etc)"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    search: Optional[str] = Query(None, description="Search term for name, brand, SKU or description"),
    sort_by: Optional[str] = Query("featured", description="featured, newest, price_asc, price_desc, bestseller"),
    is_featured: Optional[bool] = Query(None),
    is_bestseller: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(Product.is_active == True)

    # Filter by Categories
    if categories:
        cat_list = [c.strip() for c in categories.split(",") if c.strip()]
        if cat_list:
            query = query.join(Product.category).filter(
                or_(
                    Category.slug.in_([c.lower() for c in cat_list]),
                    Category.name.in_(cat_list)
                )
            )

    # Filter by Brands
    if brands:
        brand_list = [b.strip() for b in brands.split(",") if b.strip()]
        if brand_list:
            query = query.join(Product.brand)
            query = query.filter(
                or_(
                    Brand.slug.in_([b.lower().replace(" ", "-") for b in brand_list]),
                    Brand.name.in_(brand_list)
                )
            )


    # Filter by Genders
    if genders:
        gender_list = [g.strip().upper() for g in genders.split(",") if g.strip()]
        if gender_list:
            query = query.filter(Product.gender.in_(gender_list))

    # Filter by Materials
    if materials:
        mat_list = [m.strip().upper() for m in materials.split(",") if m.strip()]
        if mat_list:
            query = query.filter(Product.material.in_(mat_list))

    # Filter by Frame Types
    if frame_types:
        ft_list = [f.strip().upper() for f in frame_types.split(",") if f.strip()]
        if ft_list:
            query = query.filter(Product.frame_type.in_(ft_list))

    # Filter by Colours
    if colours:
        col_list = [c.strip().upper() for c in colours.split(",") if c.strip()]
        if col_list:
            query = query.filter(Product.colour.in_(col_list))

    # Filter by Shapes
    if frame_shapes:
        shape_list = [s.strip().upper() for s in frame_shapes.split(",") if s.strip()]
        if shape_list:
            query = query.filter(Product.frame_shape.in_(shape_list))

    # Filter by Price Range
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Flags
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    if is_bestseller is not None:
        query = query.filter(Product.is_bestseller == is_bestseller)

    # Search keyword
    if search and search.strip():
        term = f"%{search.strip()}%"
        # Join brand & category if not already joined
        query = query.outerjoin(Brand, Product.brand_id == Brand.id).outerjoin(Category, Product.category_id == Category.id)
        query = query.filter(
            or_(
                Product.name.ilike(term),
                Product.sku.ilike(term),
                Product.material.ilike(term),
                Product.colour.ilike(term),
                Product.frame_shape.ilike(term),
                Brand.name.ilike(term),
                Category.name.ilike(term)
            )
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort_by == "newest":
        query = query.order_by(desc(Product.created_at))
    elif sort_by == "bestseller":
        query = query.order_by(desc(Product.is_bestseller), desc(Product.created_at))
    else: # featured
        query = query.order_by(desc(Product.is_featured), desc(Product.is_bestseller), desc(Product.created_at))

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images)
    ).filter(or_(Product.id == product_id, Product.sku == product_id)).first()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    # Verify Brand & Category
    brand = db.query(Brand).filter(Brand.id == product_in.brand_id).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Brand ID")
    
    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Category ID")
    
    # Check SKU uniqueness
    existing_sku = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing_sku:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product with SKU '{product_in.sku}' already exists")

    product_data = product_in.dict(exclude={"additional_images"})
    new_product = Product(**product_data)
    db.add(new_product)
    db.flush()

    # Add images
    if product_in.additional_images:
        for idx, img_url in enumerate(product_in.additional_images):
            if img_url and img_url.strip():
                p_img = ProductImage(
                    product_id=new_product.id,
                    image_url=img_url.strip(),
                    alt_text=f"{new_product.name} angle {idx+1}",
                    is_primary=False,
                    sort_order=idx + 1
                )
                db.add(p_img)

    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = product_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return product

@router.patch("/{product_id}/stock", response_model=ProductResponse)
def update_product_stock(
    product_id: str,
    stock_quantity: int = Query(..., ge=0, description="New stock level to refill"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product.stock_quantity = stock_quantity
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Soft delete / deactivation
    product.is_active = False
    db.commit()
    return None

