from pydantic_settings import BaseSettings
from pydantic import model_validator
from dotenv import load_dotenv
import os
import logging

# Load .env for local dev — silently skip if not found (e.g. on Render/Railway)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path, override=False)

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str  # No default — must be set in environment
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    GOOGLE_API_KEY: str = ""
    UPLOAD_DIR: str = "uploads"
    
    # Storage
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Geofencing & Business Logic Defaults
    GEOFENCE_RADIUS_METERS: float = 500.0
    AI_CONFIDENCE_THRESHOLD: float = 0.7
    BIN_COLLECTION_THRESHOLD_PERCENT: int = 75
    SPAM_WINDOW_MINUTES: int = 30
    DEFAULT_TRUCK_CAPACITY_KG: float = 500.0

    @model_validator(mode="after")
    def check_google_api_key(self) -> "Settings":
        if not self.GOOGLE_API_KEY:
            logger.warning("WARNING: GOOGLE_API_KEY is not set. AI features will silently fail.")
        return self

    class Config:
        env_file = ".env", "../.env"  # Try both locations; skip if missing
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
