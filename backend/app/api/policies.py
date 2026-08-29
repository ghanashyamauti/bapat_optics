from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/policies", tags=["Store policies"])

@router.get("")
def get_store_policies():
    return {
        "gst_percent": settings.GST_PERCENT,
        "shipping": {"free_threshold": settings.FREE_SHIPPING_THRESHOLD, "flat_rate": settings.SHIPPING_FLAT_RATE, "pickup_free": True},
        "returns": {"window_days": settings.RETURN_WINDOW_DAYS, "conditions": ["Unused and unworn products", "Original packaging and invoice required", "Prescription lenses are non-returnable unless defective"]},
        "refunds": {"method": "Original payment method", "processing_days": "5-7 business days after approval"},
    }
