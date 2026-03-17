"""
Seed the database with initial data.
Only inserts data if the database is empty (no existing zones).
"""
from datetime import date, datetime, timezone
import bcrypt
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

from database import SessionLocal
from models.zone import Zone
from models.user import User
from models.bin import Bin, BinStatus
from models.route import Route, RouteStop, RouteStatus
from models.recycler import Recycler

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def seed_database():
    db = SessionLocal()
    try:
        # Only seed if database is empty
        existing_zones = db.query(Zone).first()
        if existing_zones:
            print("Database already has data — skipping seed.")
            return

        print("Seeding database...")

        # ── Zones ──────────────────────────────────────────────
        zone1 = Zone(
            name="Raipur North",
            description="Northern Raipur including Shankar Nagar, Pandri, and Civil Lines",
            center_lat=21.1364,
            center_lng=81.7842,
            radius_km=12.0,
        )
        zone2 = Zone(
            name="Raipur South",
            description="Southern Raipur including Telibandha, Tatibandh, and Gudhiyari",
            center_lat=21.2200,
            center_lng=81.6350,
            radius_km=10.0,
        )
        db.add_all([zone1, zone2])
        db.flush()
        print(f"  ✓ 2 zones created (IDs: {zone1.id}, {zone2.id})")

        # ── Users ──────────────────────────────────────────────
        admin = User(
            email="admin@smartwaste.com",
            full_name="System Admin",
            hashed_password=hash_password("Admin@123"),
            phone="9876543210",
            role="admin",
            is_active=True,
        )

        sub_admin1 = User(
            email="subadmin1@smartwaste.com",
            full_name="North Zone Manager",
            hashed_password=hash_password("Sub@123"),
            phone="9876543211",
            role="sub_admin",
            zone_id=zone1.id,
            is_active=True,
        )
        sub_admin2 = User(
            email="subadmin2@smartwaste.com",
            full_name="South Zone Manager",
            hashed_password=hash_password("Sub@123"),
            phone="9876543212",
            role="sub_admin",
            zone_id=zone2.id,
            is_active=True,
        )

        shg1 = User(
            email="shg1@smartwaste.com",
            full_name="SHG Worker Lakshmi",
            hashed_password=hash_password("SHG@123"),
            phone="9876543213",
            role="shg",
            zone_id=zone1.id,
            is_active=True,
        )
        shg2 = User(
            email="shg2@smartwaste.com",
            full_name="SHG Worker Meena",
            hashed_password=hash_password("SHG@123"),
            phone="9876543214",
            role="shg",
            zone_id=zone1.id,
            is_active=True,
        )
        shg3 = User(
            email="shg3@smartwaste.com",
            full_name="SHG Worker Sunita",
            hashed_password=hash_password("SHG@123"),
            phone="9876543215",
            role="shg",
            zone_id=zone2.id,
            is_active=True,
        )

        collector1 = User(
            email="collector1@smartwaste.com",
            full_name="Collector Ramesh",
            hashed_password=hash_password("Col@123"),
            phone="9876543216",
            role="collector",
            zone_id=zone1.id,
            is_active=True,
        )
        collector2 = User(
            email="collector2@smartwaste.com",
            full_name="Collector Suresh",
            hashed_password=hash_password("Col@123"),
            phone="9876543217",
            role="collector",
            zone_id=zone2.id,
            is_active=True,
        )

        all_users = [admin, sub_admin1, sub_admin2, shg1, shg2, shg3, collector1, collector2]
        db.add_all(all_users)
        db.flush()
        print(f"  ✓ 8 users created (admin, 2 sub-admins, 3 SHG, 2 collectors)")

        # ── Bins (15 bins with real Raipur, CG GPS coordinates) ──
        bins_data = [
            # Zone 1 — Raipur North
            ("BIN-N01", 21.2514, 81.6296, "Shankar Nagar Chowk", zone1.id, BinStatus.empty, 0),
            ("BIN-N02", 21.2470, 81.6340, "Pandri Market", zone1.id, BinStatus.low, 20),
            ("BIN-N03", 21.2550, 81.6250, "Civil Lines", zone1.id, BinStatus.medium, 50),
            ("BIN-N04", 21.2490, 81.6210, "Jaistambh Chowk", zone1.id, BinStatus.high, 78),
            ("BIN-N05", 21.2600, 81.6310, "Budha Talab", zone1.id, BinStatus.full, 95),
            ("BIN-N06", 21.2530, 81.6380, "Purani Basti", zone1.id, BinStatus.overflow, 100),
            ("BIN-N07", 21.2450, 81.6270, "Fafadih Chowk", zone1.id, BinStatus.medium, 45),
            ("BIN-N08", 21.2580, 81.6200, "Mowa", zone1.id, BinStatus.low, 15),
            # Zone 2 — Raipur South
            ("BIN-S01", 21.2200, 81.6350, "Telibandha Lake", zone2.id, BinStatus.empty, 5),
            ("BIN-S02", 21.2150, 81.6400, "Tatibandh", zone2.id, BinStatus.high, 80),
            ("BIN-S03", 21.2100, 81.6300, "Gudhiyari", zone2.id, BinStatus.full, 92),
            ("BIN-S04", 21.2250, 81.6280, "VIP Estate", zone2.id, BinStatus.medium, 55),
            ("BIN-S05", 21.2180, 81.6450, "Amanaka", zone2.id, BinStatus.overflow, 100),
            ("BIN-S06", 21.2300, 81.6320, "Magneto Mall Area", zone2.id, BinStatus.low, 25),
            ("BIN-S07", 21.2050, 81.6370, "Sunder Nagar", zone2.id, BinStatus.empty, 0),
        ]

        bin_objects = []
        for label, lat, lng, addr, z_id, status, fill in bins_data:
            b = Bin(
                label=label,
                location=from_shape(Point(lng, lat), srid=4326),
                latitude=lat,
                longitude=lng,
                address=addr,
                zone_id=z_id,
                status=status,
                fill_level=fill,
                capacity_kg=50.0,
            )
            bin_objects.append(b)

        db.add_all(bin_objects)
        db.flush()
        print(f"  ✓ 15 bins created (8 North, 7 South)")

        # ── Route for collector1 → today with 5 stops ──────────
        today = date.today()
        route = Route(
            name=f"North Zone Collection — {today.isoformat()}",
            collector_id=collector1.id,
            zone_id=zone1.id,
            date=today,
            status=RouteStatus.planned,
            total_distance_km=8.5,
            estimated_duration_min=90,
            optimized=1,
        )
        db.add(route)
        db.flush()

        # Pick first 5 North-zone bins for the route stops
        north_bins = [b for b in bin_objects if b.zone_id == zone1.id][:5]
        for seq, stop_bin in enumerate(north_bins, start=1):
            stop = RouteStop(
                route_id=route.id,
                bin_id=stop_bin.id,
                sequence=seq,
                status="pending",
            )
            db.add(stop)

        db.commit()
        print(f"  ✓ 1 route created with 5 stops for collector1")
        
        # ── Recyclers ──────────────────────────────────────────
        recyclers = [
            Recycler(
                name="Sharma Plastics Raipur",
                contact_person="Rajesh Sharma",
                phone="9876543210",
                address="Near Industrial Estate, Bhanpuri",
                latitude=21.2514,
                longitude=81.6296,
                accepted_types=["plastic", "mixed"],
                price_per_kg=12.00,
                min_quantity_kg=50.0,
                zone_id=zone1.id,
                is_active=True
            ),
            Recycler(
                name="GreenCycle Chhattisgarh",
                contact_person="Priya Verma",
                phone="9765432109",
                address="Ring Road No. 1, Telibandha",
                latitude=21.2344,
                longitude=81.6512,
                accepted_types=["all"],
                price_per_kg=15.00,
                min_quantity_kg=25.0,
                zone_id=zone1.id,
                is_active=True
            ),
            Recycler(
                name="Raipur Kabadiwala Network",
                contact_person="Suresh Patel",
                phone="9654321098",
                address="Bhatagaon Bypass Area",
                latitude=21.2601,
                longitude=81.6189,
                accepted_types=["plastic"],
                price_per_kg=8.50,
                min_quantity_kg=100.0,
                zone_id=zone2.id,
                is_active=True
            ),
            Recycler(
                name="EcoPlas Industries",
                contact_person="Amit Gupta",
                phone="9543210987",
                address="Tatibandh Industrial Area",
                latitude=21.2198,
                longitude=81.6445,
                accepted_types=["all"],
                price_per_kg=18.00,
                min_quantity_kg=10.0,
                zone_id=zone2.id,
                is_active=True
            )
        ]
        db.add_all(recyclers)
        db.flush()
        print(f"  ✓ {len(recyclers)} recyclers created")
        db.commit()

        print("Seed data inserted successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
