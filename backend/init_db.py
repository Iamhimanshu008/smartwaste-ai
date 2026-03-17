"""
Initialize the database by creating all tables.
Run this script on first startup to set up the schema.
"""
from database import engine, Base

# Import all models so they register with Base.metadata
from models.zone import Zone
from models.user import User
from models.bin import Bin
from models.report import BinReport, SHGReport
from models.route import Route, RouteStop


def init_db():
    """Create all tables defined in the models."""
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")


if __name__ == "__main__":
    init_db()
