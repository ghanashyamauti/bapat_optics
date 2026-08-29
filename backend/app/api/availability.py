from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Product

router = APIRouter(prefix="/availability", tags=["Branch availability"])

@router.get("/{product_id}")
def product_availability(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter((Product.id == product_id) | (Product.sku == product_id), Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    branch_stock = product.branch_stock or {}
    return {"product_id": product.id, "sku": product.sku, "total_stock": product.stock_quantity, "branches": [{"name": name, "available": int(quantity or 0), "in_stock": int(quantity or 0) > 0} for name, quantity in branch_stock.items()]}
