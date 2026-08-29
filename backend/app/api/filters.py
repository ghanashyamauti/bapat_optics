from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.models import Product, Brand, Category
from app.schemas.schemas import MasterFiltersResponse, FilterAttributeOption

router = APIRouter(prefix="/filters", tags=["Master Filters"])

# Comprehensive Color Hex Map matching the reference site colors
COLOR_HEX_MAP = {
    "SOLID BLUE": "#1E3A8A",
    "MATTE BLACK": "#1A1A1A",
    "SOLID PURPLE": "#6B21A8",
    "SOLID GREY": "#4B5563",
    "SOLID BLACK": "#050505",
    "SOLID PINK": "#F472B6",
    "SOLID BROWN": "#78350F",
    "SOLID GREEN": "#065F46",
    "SOLID WHITE": "#F9FAFB",
    "SOLID SROSE GOLD": "#E0A899",
    "MATTE HAVANA": "#92400E",
    "MATTE BLUE": "#2563EB",
    "SOLID GUNMETAL": "#374151",
    "TRANSPARENT": "#E2E8F0",
    "SOLID GOLD": "#C6A15B",
    "MATTE GRAY": "#6B7280",
    "SOLID SILVER": "#D1D5DB",
    "MATTE RED": "#DC2626",
    "MATTE WHITE": "#F3F4F6",
    "SOLID RED": "#B91C1C",
    "MATTE BROWN": "#78350F",
    "MATTE GREEN": "#047857",
    "CLEAR": "#F8FAFC",
    "PHOTOCHROMATIC X-GRAY": "#475569",
    "PHOTO FUSION X": "#334155",
    "PHOTO GREY": "#64748B",
    "PHOTO FUSION GREY": "#475569",
    "DA BROWN": "#451A03",
    "GRADIENT BROWN": "#78350F"
}

# Shape Icon identifiers
SHAPE_ICONS = {
    "HEXAGON": "hexagon",
    "SQUARE": "square",
    "WAYFARER": "wayfarer",
    "CAT EYE": "cat-eye",
    "OVAL": "oval",
    "ROUND": "circle",
    "AVIATOR": "aviator",
    "HEXAGONE": "hexagon"
}

@router.get("", response_model=MasterFiltersResponse)
def get_master_filters(db: Session = Depends(get_db)):
    # Categories with count
    cat_counts = db.query(
        Category.name, Category.slug, Category.icon, func.count(Product.id)
    ).outerjoin(Product, (Product.category_id == Category.id) & (Product.is_active == True))\
     .filter(Category.is_active == True)\
     .group_by(Category.name, Category.slug, Category.icon, Category.sort_order)\
     .order_by(Category.sort_order, Category.name).all()

    categories = [
        FilterAttributeOption(
            label=c[0],
            value=c[1],
            count=c[3] or 0,
            icon=c[2]
        )
        for c in cat_counts
    ]

    # Brands with count
    brand_counts = db.query(
        Brand.name, Brand.slug, func.count(Product.id)
    ).outerjoin(Product, (Product.brand_id == Brand.id) & (Product.is_active == True))\
     .filter(Brand.is_active == True)\
     .group_by(Brand.name, Brand.slug)\
     .order_by(Brand.name).all()

    brands = [
        FilterAttributeOption(
            label=b[0],
            value=b[1],
            count=b[2] or 0
        )
        for b in brand_counts
    ]

    # Genders
    gender_counts = db.query(Product.gender, func.count(Product.id))\
        .filter(Product.is_active == True)\
        .group_by(Product.gender).all()
    gender_map = {g[0]: g[1] for g in gender_counts if g[0]}
    master_genders = ["MEN", "WOMEN", "UNISEX", "KIDS"]
    genders = [
        FilterAttributeOption(
            label=g,
            value=g,
            count=gender_map.get(g, 0)
        )
        for g in master_genders
    ]

    # Materials
    master_materials = [
        "TR", "ACETATE", "METAL", "PLASTIC", "PLASTIC ULTRA LIGHT", "PLASTIC +ULTRA LIGHT",
        "PLASTIC TR", "METAL TITA", "METAL TITANIUM", "TITANIUM", "PLASTIC + TITANIUM",
        "CR39", "CR40", "MR8", "HI PLASTIC MR7", "HI PLASTIC", "HI PLASTIC MR8", "HI PLASTIC MR9",
        "CR 39", "POLY", "MR7", "POLYMACON"
    ]
    mat_counts = db.query(Product.material, func.count(Product.id))\
        .filter(Product.is_active == True)\
        .group_by(Product.material).all()
    mat_map = {m[0]: m[1] for m in mat_counts if m[0]}
    materials = [
        FilterAttributeOption(
            label=m,
            value=m,
            count=mat_map.get(m, 0)
        )
        for m in master_materials
    ]

    # Frame Types
    master_frame_types = ["FULL FRAME", "SUPRA", "RIMLESS", "MFULL"]
    ft_counts = db.query(Product.frame_type, func.count(Product.id))\
        .filter(Product.is_active == True)\
        .group_by(Product.frame_type).all()
    ft_map = {f[0]: f[1] for f in ft_counts if f[0]}
    frame_types = [
        FilterAttributeOption(
            label=f,
            value=f,
            count=ft_map.get(f, 0)
        )
        for f in master_frame_types
    ]

    # Colours
    master_colours = [
        "SOLID BLUE", "MATTE BLACK", "SOLID PURPLE", "SOLID GREY", "SOLID BLACK",
        "SOLID PINK", "SOLID BROWN", "SOLID GREEN", "SOLID WHITE", "SOLID SROSE GOLD",
        "MATTE HAVANA", "MATTE BLUE", "SOLID GUNMETAL", "TRANSPARENT", "SOLID GOLD",
        "MATTE GRAY", "SOLID SILVER", "MATTE RED", "MATTE WHITE", "SOLID RED",
        "MATTE BROWN", "MATTE GREEN", "CLEAR", "PHOTOCHROMATIC X-GRAY",
        "PHOTO FUSION X", "PHOTO GREY", "PHOTO FUSION GREY", "DA BROWN", "GRADIENT BROWN"
    ]
    col_counts = db.query(Product.colour, func.count(Product.id))\
        .filter(Product.is_active == True)\
        .group_by(Product.colour).all()
    col_map = {c[0]: c[1] for c in col_counts if c[0]}
    colours = [
        FilterAttributeOption(
            label=c,
            value=c,
            count=col_map.get(c, 0),
            hex_color=COLOR_HEX_MAP.get(c, "#94A3B8")
        )
        for c in master_colours
    ]

    # Frame Shapes
    master_shapes = ["HEXAGON", "SQUARE", "WAYFARER", "CAT EYE", "OVAL", "ROUND", "AVIATOR", "HEXAGONE"]
    shape_counts = db.query(Product.frame_shape, func.count(Product.id))\
        .filter(Product.is_active == True)\
        .group_by(Product.frame_shape).all()
    shape_map = {s[0]: s[1] for s in shape_counts if s[0]}
    frame_shapes = [
        FilterAttributeOption(
            label=s,
            value=s,
            count=shape_map.get(s, 0),
            icon=SHAPE_ICONS.get(s, "circle")
        )
        for s in master_shapes
    ]

    # Price range
    price_stats = db.query(
        func.min(Product.price), func.max(Product.price)
    ).filter(Product.is_active == True).first()

    min_price = float(price_stats[0]) if price_stats and price_stats[0] is not None else 1500.0
    max_price = float(price_stats[1]) if price_stats and price_stats[1] is not None else 45000.0

    return {
        "categories": categories,
        "genders": genders,
        "materials": materials,
        "frame_types": frame_types,
        "colours": colours,
        "brands": brands,
        "frame_shapes": frame_shapes,
        "min_price": min_price,
        "max_price": max_price
    }
