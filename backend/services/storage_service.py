import cloudinary
import cloudinary.uploader
import os
import logging
from config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

CLOUDINARY_FOLDER = "smartwaste"

def is_cloudinary_configured() -> bool:
    return all([
        settings.CLOUDINARY_CLOUD_NAME,
        settings.CLOUDINARY_API_KEY,
        settings.CLOUDINARY_API_SECRET
    ])

async def upload_image(file_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> str:
    """
    Upload image to Cloudinary (production) or local /uploads (fallback).
    Returns the public URL of the uploaded image.
    """
    if is_cloudinary_configured():
        try:
            result = cloudinary.uploader.upload(
                file_bytes,
                folder=CLOUDINARY_FOLDER,
                public_id=filename.rsplit(".", 1)[0],
                resource_type="image",
                overwrite=True,
                format=filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
            )
            url = result.get("secure_url", "")
            logger.info(f"✅ Cloudinary upload success: {url}")
            return url
        except Exception as e:
            logger.error(f"❌ Cloudinary upload failed: {e}")
            raise RuntimeError(f"Image upload failed: {str(e)}")
    else:
        # Local fallback
        logger.warning("⚠️ Cloudinary not configured — using local file storage fallback")
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        return f"/uploads/{filename}"

def delete_image(public_url: str) -> bool:
    """Delete image from Cloudinary by URL."""
    if is_cloudinary_configured() and "cloudinary.com" in public_url:
        try:
            # Extract public_id from URL
            parts = public_url.split("/")
            public_id = CLOUDINARY_FOLDER + "/" + parts[-1].rsplit(".", 1)[0]
            cloudinary.uploader.destroy(public_id)
            logger.info(f"✅ Cloudinary delete success: {public_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Cloudinary delete failed: {e}")
            return False
    return False
