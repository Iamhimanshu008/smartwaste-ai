from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env for local dev — silently skip if not found (e.g. on Render/Railway)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path, override=False)


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/smartwaste"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GOOGLE_API_KEY: str = ""
    UPLOAD_DIR: str = "uploads"
    GEOFENCE_RADIUS_METERS: float = 500.0
    AI_CONFIDENCE_THRESHOLD: float = 0.7
    BIN_COLLECTION_THRESHOLD_PERCENT: int = 75
    SPAM_WINDOW_MINUTES: int = 30
    DEFAULT_TRUCK_CAPACITY_KG: float = 500.0

    class Config:
        env_file = ".env", "../.env"  # Try both locations; skip if missing
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
