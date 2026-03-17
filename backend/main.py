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
from models import Zone, User, Bin, BinReport, SHGReport, Route, RouteStop, Collection, Recycler, RecyclerBid
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

    # Create all tables
    Base.metadata.create_all(bind=engine)
    sync_database_schema(engine)
    print("✓ Tables created successfully!")

    # Seed data if database is empty
    db = SessionLocal()
    try:
        if db.query(User).first() is None:
            from seed_data import seed_database
            seed_database()
            print("✓ Seed data loaded!")
        else:
            print("✓ Database already seeded.")
    except Exception as e:
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

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for serving photos
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include all routers
from routers.auth import router as auth_router
from routers.public import router as public_router
from routers.admin import router as admin_router
from routers.subadmin import router as subadmin_router
from routers.shg import router as shg_router
from routers.collector import router as collector_router
from routers.recycler import router as recycler_router

app.include_router(auth_router)
app.include_router(public_router)
app.include_router(admin_router)
app.include_router(subadmin_router)
app.include_router(shg_router)
app.include_router(collector_router)
app.include_router(recycler_router)


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
