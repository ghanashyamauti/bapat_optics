import os
import json
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Bapat Optics Luxury API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secrets are supplied through backend/.env (see .env.example). Never commit them.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bapat_local.db")
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    RAZORPAY_CURRENCY: str = os.getenv("RAZORPAY_CURRENCY", "INR")
    MOCK_PAYMENTS: bool = os.getenv("MOCK_PAYMENTS", "false").lower() == "true"
    
    BAPAT_WHATSAPP_NUMBER: str = os.getenv("BAPAT_WHATSAPP_NUMBER", "+919175586133")
    BAPAT_OFFICIAL_EMAIL: str = os.getenv("BAPAT_OFFICIAL_EMAIL", "bapatopticsonline@gmail.com")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    OPTOMETRIST_EMAIL: str = os.getenv("OPTOMETRIST_EMAIL", "")
    OPTOMETRIST_PASSWORD: str = os.getenv("OPTOMETRIST_PASSWORD", "")
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "")
    SHIPPING_PROVIDER: str = os.getenv("SHIPPING_PROVIDER", "manual")
    ANALYTICS_PROVIDER: str = os.getenv("ANALYTICS_PROVIDER", "none")
    GST_PERCENT: float = float(os.getenv("GST_PERCENT", "18"))
    FREE_SHIPPING_THRESHOLD: float = float(os.getenv("FREE_SHIPPING_THRESHOLD", "5000"))
    SHIPPING_FLAT_RATE: float = float(os.getenv("SHIPPING_FLAT_RATE", "99"))
    RETURN_WINDOW_DAYS: int = int(os.getenv("RETURN_WINDOW_DAYS", "7"))
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175")
    """Comma-separated origins; converted to a list after settings load."""
    CORS_ORIGINS_DEFAULT: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ]

    class Config:
        case_sensitive = True

settings = Settings()
settings.CORS_ORIGINS = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
