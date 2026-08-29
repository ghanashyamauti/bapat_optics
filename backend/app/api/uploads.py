from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.deps import get_current_active_admin
from app.models.models import User

router = APIRouter(prefix="/uploads", tags=["Admin uploads"])
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
MAX_BYTES = 8 * 1024 * 1024


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_active_admin),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only JPEG, PNG, WebP or AVIF images are allowed")
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image must be 8MB or smaller")
    suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif"}[file.content_type]
    filename = f"{uuid4().hex}{suffix}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / filename).write_bytes(data)
    return {"url": f"/uploads/{filename}", "filename": filename, "content_type": file.content_type}


ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime", "video/ogg", "video/x-matroska"}
MAX_VIDEO_BYTES = 50 * 1024 * 1024


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    _: User = Depends(get_current_active_admin),
):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only MP4, WebM or QuickTime MOV videos are allowed"
        )
    data = await file.read(MAX_VIDEO_BYTES + 1)
    if len(data) > MAX_VIDEO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Video must be 50MB or smaller"
        )
    suffix = {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
        "video/ogg": ".ogg",
        "video/x-matroska": ".mkv"
    }.get(file.content_type, ".mp4")
    filename = f"vid_{uuid4().hex}{suffix}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / filename).write_bytes(data)
    return {"url": f"/uploads/{filename}", "filename": filename, "content_type": file.content_type}
