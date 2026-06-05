import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/app", tags=["app"])

class VersionInfo(BaseModel):
    latest_version: str
    apk_url: str
    release_notes: str
    force_update: bool = False

@router.get("/version", response_model=VersionInfo)
def get_latest_version():
    LATEST_VERSION = {
        "latest_version": os.getenv("APP_LATEST_VERSION", "2.4.0"),
        "apk_url": os.getenv("APP_APK_URL", 
            "https://github.com/Iamhimanshu008/smartwaste-ai/releases/download/v2.4.0/SmartWasteAI-v2.4.0.apk"),
        "release_notes": os.getenv("APP_RELEASE_NOTES", 
            "Bug fixes and performance improvements"),
        "force_update": os.getenv("APP_FORCE_UPDATE", "false").lower() == "true"
    }
    return LATEST_VERSION
