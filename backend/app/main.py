import mimetypes
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import text

# Register 3D model MIME types for StaticFiles serving
mimetypes.add_type("model/gltf-binary", ".glb")
mimetypes.add_type("model/gltf+json", ".gltf")
from app.core.middleware import SecurityMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, products, filters, inquiries, orders, appointments, crm, uploads, policies, availability

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url VARCHAR(1000);"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_image_url VARCHAR(1000);"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_bridge_x FLOAT DEFAULT 0.5;"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_bridge_y FLOAT DEFAULT 0.45;"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_scale FLOAT DEFAULT 1.0;"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_side_image_url VARCHAR(1000);"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_side_anchor_x FLOAT DEFAULT 0.15;"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_side_anchor_y FLOAT DEFAULT 0.5;"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_side_scale FLOAT DEFAULT 1.0;"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS tryon_asset_type VARCHAR(50) DEFAULT '2d';"))
except Exception as e:
    print(f"Schema migration note: {e}")

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class CORSStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

# Synchronize legacy/existing uploads from app/uploads into UPLOAD_DIR (ignoring old test files)
LEGACY_UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
if LEGACY_UPLOAD_DIR.exists() and LEGACY_UPLOAD_DIR != UPLOAD_DIR:
    try:
        import shutil
        for item in LEGACY_UPLOAD_DIR.iterdir():
            if item.is_file() and not item.name.startswith('.') and not item.name.startswith('tryon_') and not item.name.startswith('temple_arm_') and item.name != 'rayban_headliner_tryon.png':
                dest = UPLOAD_DIR / item.name
                if not dest.exists():
                    shutil.copy2(item, dest)
    except Exception as e:
        print(f"Legacy upload sync note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Bapat Optics Enterprise Luxury Eyewear & CRM API Backend",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration — supports local development and all Vercel domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityMiddleware)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(filters.router, prefix=settings.API_V1_STR)
app.include_router(inquiries.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router, prefix=settings.API_V1_STR)
app.include_router(crm.router, prefix=settings.API_V1_STR)
app.include_router(uploads.router, prefix=settings.API_V1_STR)
app.include_router(policies.router, prefix=settings.API_V1_STR)
app.include_router(availability.router, prefix=settings.API_V1_STR)
app.mount("/uploads", CORSStaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "Bapat Optics Luxury API",
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/api/v1")
@app.get("/api/v1/")
def api_v1_index():
    return {
        "status": "online",
        "service": "Bapat Optics API v1",
        "docs": "/docs",
        "endpoints": {
            "products": "/api/v1/products",
            "filters": "/api/v1/filters",
            "orders": "/api/v1/orders",
            "appointments": "/api/v1/appointments",
            "inquiries": "/api/v1/inquiries",
            "auth": "/api/v1/auth"
        }
    }

@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")
