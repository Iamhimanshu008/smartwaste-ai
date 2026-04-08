"""
SmartWaste AI — FastAPI Application Entry Point
"""
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from config import settings
from database import engine, Base, SessionLocal
from models import Zone, User, Bin, BinReport, SHGReport, Route, RouteStop, Collection, Recycler, RecyclerBid, Notification
from services.schema_sync import sync_database_schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: wait for DB, create tables, then seed data if empty."""

    # --- Wait for Postgres to be ready (up to 30s) ---
    max_retries = 15
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"✓ Database connected (attempt {attempt})")
            break
        except Exception as e:
            if attempt == max_retries:
                print(f"✗ Could not connect to database after {max_retries} attempts: {e}")
                raise
            print(f"  Waiting for database... (attempt {attempt}/{max_retries})")
            time.sleep(2)

    # Enable PostGIS extension (required on Neon — Docker image has it pre-installed)
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis_topology;"))
            conn.commit()
        print("✓ PostGIS extensions enabled")
    except Exception as e:
        print(f"⚠️ PostGIS extension note: {e}")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    sync_database_schema(engine)
    print("✓ Tables created successfully!")

    # Seed data — run exactly once (tracked via seed_metadata table)
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS seed_metadata (
                key VARCHAR(100) PRIMARY KEY,
                seeded_at TIMESTAMP DEFAULT NOW()
            );
        """))
        conn.commit()

    db = SessionLocal()
    try:
        result = db.execute(text("SELECT key FROM seed_metadata WHERE key = 'initial_seed'")).fetchone()
        if result is None:
            from seed_data import seed_database
            seed_database()
            db.execute(text("INSERT INTO seed_metadata (key) VALUES ('initial_seed')"))
            db.commit()
            print("✓ Seed data loaded (first-time setup)!")
        else:
            print("✓ Seed already done — skipping.")
    except Exception as e:
        db.rollback()
        print(f"  Seed data info: {e}")
    finally:
        db.close()

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    yield  # App runs here


app = FastAPI(
    title="SmartWaste AI",
    description="Rural plastic waste management platform — Chhattisgarh, India",
    version="2.0.0",
    lifespan=lifespan,
)

allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

# Always include these origins (local dev + deployed frontends)
ALLOWED_ORIGINS += [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://smartwaste-ai-omega.vercel.app",
]
# Deduplicate
ALLOWED_ORIGINS = list(set(ALLOWED_ORIGINS))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (mobile app + web + Vercel)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists before mounting (StaticFiles validates at mount time)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include all routers
from routers.auth import router as auth_router
from routers.public import router as public_router
from routers.admin import router as admin_router
from routers.subadmin import router as subadmin_router
from routers.shg import router as shg_router
from routers.collector import router as collector_router
from routers.recycler import router as recycler_router
from routers.notifications import router as notifications_router

app.include_router(auth_router)
app.include_router(public_router)
app.include_router(admin_router)
app.include_router(subadmin_router)
app.include_router(shg_router)
app.include_router(collector_router)
app.include_router(recycler_router)
app.include_router(notifications_router)


@app.get("/")
def root():
    return {
        "app": "SmartWaste AI",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
