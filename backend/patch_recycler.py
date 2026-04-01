import sys
import os

from database import SessionLocal
from models.user import User
from models.recycler import Recycler, RecyclerBid, BidStatus
from models.zone import Zone
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def run_patch():
    db = SessionLocal()
    try:
        # Get first zone
        zone = db.query(Zone).first()
        if not zone:
            print("No zones exist. Run seed_data.py first.")
            return

        # Check for our recycler user
        user = db.query(User).filter(User.email == "recycler1@smartwaste.com").first()
        if not user:
            print("Adding User: recycler1@smartwaste.com")
            user = User(
                email="recycler1@smartwaste.com",
                hashed_password=hash_password("Rec@123"),
                full_name="GreenCycle Chhattisgarh",
                role="recycler",
                zone_id=zone.id,
                is_active=True,
            )
            db.add(user)

        # Check for Recycler record
        rec = db.query(Recycler).filter(Recycler.email == "recycler1@smartwaste.com").first()
        if not rec:
            print("Adding Recycler: GreenCycle Chhattisgarh")
            rec = Recycler(
                name="GreenCycle Chhattisgarh",
                contact_person="Ramesh Kumar",
                phone="9876543210",
                email="recycler1@smartwaste.com",
                address="Phase 1, Siltara Industrial Area, Raipur",
                accepted_types=["PET", "HDPE"],
                price_per_kg=12.50,
                min_quantity_kg=50.0,
                zone_id=zone.id,
                is_active=True,
            )
            db.add(rec)
            db.flush() # get rec.id

        # Insert some dummy bids if none exist
        if rec and not getattr(rec, 'bids', []):
            print("Adding 3 Dummy Bids to test Recycler Dashboard...")
            bids = [
                RecyclerBid(
                    recycler_id=rec.id,
                    report_id=None,
                    collection_id=None,
                    offered_price_per_kg=12.50,
                    quantity_kg=250.0,
                    status=BidStatus.pending
                ),
                RecyclerBid(
                    recycler_id=rec.id,
                    report_id=None,
                    collection_id=None,
                    offered_price_per_kg=12.50,
                    quantity_kg=105.0,
                    status=BidStatus.accepted
                ),
                RecyclerBid(
                    recycler_id=rec.id,
                    report_id=None,
                    collection_id=None,
                    offered_price_per_kg=10.00,
                    quantity_kg=500.0,
                    status=BidStatus.completed
                )
            ]
            db.add_all(bids)

        db.commit()
        print("✓ Recycler patch executed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_patch()
