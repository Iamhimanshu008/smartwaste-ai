"""
Seed the database with initial data for Atal Nagar-Nava Raipur.
Only inserts data if the database is empty (no existing zones).
"""
import random
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

        print("Seeding database for Nava Raipur (4 Zones)...")

        # ── Zones ──────────────────────────────────────────────
        zone1 = Zone(
            name="Zone 1 (North)",
            description="Covering Sector 24, Mantralaya, Sector 27",
            center_lat=21.1614,   
            center_lng=81.7869,
            radius_km=5.0,
        )
        zone2 = Zone(
            name="Zone 2 (South)",
            description="Covering IIIT Naya Raipur, Hidayatullah Law University",
            center_lat=21.1490,
            center_lng=81.7650,
            radius_km=6.0,
        )
        zone3 = Zone(
            name="Zone 3 (East)",
            description="Covering the route towards Swami Vivekananda Airport",
            center_lat=21.1850,
            center_lng=81.7300,
            radius_km=8.0,
        )
        zone4 = Zone(
            name="Zone 4 (West)",
            description="Covering Western Ring Road and Telibandha Lake End",
            center_lat=21.2266,
            center_lng=81.6600,
            radius_km=8.0,
        )
        
        db.add_all([zone1, zone2, zone3, zone4])
        db.commit()
        db.refresh(zone1)
        db.refresh(zone2)
        db.refresh(zone3)
        db.refresh(zone4)

        zones = [zone1, zone2, zone3, zone4]

        # ── Users ──────────────────────────────────────────────
        users = []
        
        # 1 Admin
        admin = User(
            email="admin@smartwaste.com",
            hashed_password=hash_password("Admin@123"),
            full_name="System Admin",
            role="admin",
            is_active=True,
        )
        users.append(admin)

        # 4 Sub-Admins (One per zone)
        for i, zone in enumerate(zones, 1):
            subadmin = User(
                email=f"subadmin{i}@smartwaste.com",
                hashed_password=hash_password("Sub@123"),
                full_name=f"{zone.name} Manager",
                role="sub_admin",
                zone_id=zone.id,
                is_active=True,
            )
            users.append(subadmin)

        # 8 SHG Workers (2 per zone)
        for i in range(1, 9):
            shg = User(
                email=f"shg{i}@smartwaste.com",
                hashed_password=hash_password("SHG@123"),
                full_name=f"SHG Worker {i}",
                role="shg",
                zone_id=zones[i % 4].id, 
                is_active=True,
            )
            users.append(shg)

        # 4 Collectors (1 per zone)
        collectors = []
        for i in range(1, 5):
            collector = User(
                email=f"collector{i}@smartwaste.com",
                hashed_password=hash_password("Col@123"),
                full_name=f"Truck Driver {i}",
                role="collector",
                zone_id=zones[(i - 1) % 4].id,
                is_active=True,
            )
            users.append(collector)
            collectors.append(collector)

        # 1 Dummy Recycler User
        recycler_user = User(
            email="recycler1@smartwaste.com",
            hashed_password=hash_password("Rec@123"),
            full_name="GreenCycle Chhattisgarh",
            role="recycler",
            zone_id=zones[0].id,
            is_active=True,
        )
        users.append(recycler_user)

        db.add_all(users)
        db.commit()

        # Refresh collectors to get their IDs
        for c in collectors:
            db.refresh(c)

        # ── Bins ──────────────────────────────────────────────
        # Landmarks and variations mapping strictly to 4 zones
        
        bin_locations = [
            # Zone 1 (North)
            {"label": "Mantralaya North Gate", "lat": 21.1610, "lng": 81.7865, "zone": zone1, "address": "Mahanadi Bhawan, Sector 19"},
            {"label": "Sector 24 Commercial Complex", "lat": 21.1450, "lng": 81.7900, "zone": zone1, "address": "Sector 24, Nava Raipur"},
            {"label": "Central Park Entrance", "lat": 21.1550, "lng": 81.7850, "zone": zone1, "address": "Central Park, Sector 24"},
            {"label": "Sector 27 Residential Area", "lat": 21.1680, "lng": 81.7920, "zone": zone1, "address": "Block B, Sector 27"},
            {"label": "Sathya Sai Hospital Gate", "lat": 21.1510, "lng": 81.7800, "zone": zone1, "address": "Sector 2, Nava Raipur"},
            {"label": "Purkhouti Muktangan Tourist Spot", "lat": 21.1444, "lng": 81.7880, "zone": zone1, "address": "Sector 24"},
            
            # Zone 2 (South)
            {"label": "IIIT Naya Raipur Campus", "lat": 21.1495, "lng": 81.7655, "zone": zone2, "address": "Sector 24, Near IIIT"},
            {"label": "Hidayatullah Law University", "lat": 21.1555, "lng": 81.7600, "zone": zone2, "address": "HNLU Campus Gate"},
            {"label": "IIM Raipur Main Road", "lat": 21.1400, "lng": 81.7580, "zone": zone2, "address": "IIM Raipur Campus, Sector 15"},
            {"label": "Sector 15 Student Hostel", "lat": 21.1420, "lng": 81.7610, "zone": zone2, "address": "Student Quarters, Sector 15"},
            {"label": "Sector 17 Food Court", "lat": 21.1580, "lng": 81.7680, "zone": zone2, "address": "Sector 17 Eateries"},
            {"label": "Library Avenue", "lat": 21.1480, "lng": 81.7630, "zone": zone2, "address": "Sector 24 Library Area"},
            
            # Zone 3 (East)
            {"label": "Airport VIP Road", "lat": 21.1850, "lng": 81.7300, "zone": zone3, "address": "VIP Road Crossing"},
            {"label": "Swami Vivekananda Airport T1", "lat": 21.1800, "lng": 81.7350, "zone": zone3, "address": "Terminal 1 Gate"},
            {"label": "Mana Camp Settlement", "lat": 21.1750, "lng": 81.7250, "zone": zone3, "address": "Mana Camp Area"},
            {"label": "Sector 4 VIP Gateway", "lat": 21.1905, "lng": 81.7550, "zone": zone3, "address": "Sector 4 Entrance"},
            {"label": "Sector 16 Mall Road", "lat": 21.1820, "lng": 81.7500, "zone": zone3, "address": "Sector 16 Central"},
            
            # Zone 4 (West)
            {"label": "Ram Mandir Square", "lat": 21.1900, "lng": 81.7200, "zone": zone4, "address": "VIP Road, Ram Mandir"},
            {"label": "Serikhedi Junction", "lat": 21.2000, "lng": 81.7450, "zone": zone4, "address": "Serikhedi Highway Point"},
            {"label": "Pachpedi Naka Gateway", "lat": 21.2100, "lng": 81.6800, "zone": zone4, "address": "Ring Road No 1 Crossing"},
            {"label": "Telibandha Lake End", "lat": 21.2266, "lng": 81.6600, "zone": zone4, "address": "Marine Drive, Telibandha"},
            {"label": "Shastri Market Crossing", "lat": 21.2350, "lng": 81.6400, "zone": zone4, "address": "City West Core, Shastri Market"},
            {"label": "Amanaka Bus Stand", "lat": 21.2450, "lng": 81.6100, "zone": zone4, "address": "Amanaka West Junction"}
        ]

        # Ensure we have a decent number of bins
        db_bins = []
        for i, b_data in enumerate(bin_locations):
            # Assign varying statuses
            rand_val = random.randint(0, 100)
            if rand_val < 15:
                fill_lvl = random.randint(0, 10)
                status = BinStatus.empty
            elif rand_val < 35:
                fill_lvl = random.randint(11, 40)
                status = BinStatus.low
            elif rand_val < 60:
                fill_lvl = random.randint(41, 70)
                status = BinStatus.medium
            elif rand_val < 80:
                fill_lvl = random.randint(71, 90)
                status = BinStatus.high
            elif rand_val < 95:
                fill_lvl = random.randint(91, 100)
                status = BinStatus.full
            else:
                fill_lvl = 100
                status = BinStatus.overflow
                
            db_bin = Bin(
                label=b_data["label"],
                latitude=b_data["lat"],
                longitude=b_data["lng"],
                address=b_data["address"],
                zone_id=b_data["zone"].id,
                capacity_kg=250.0,
                fill_level=fill_lvl,
                status=status,
                location=from_shape(Point(b_data["lng"], b_data["lat"]), srid=4326),
                last_collected=None,
            )
            db_bins.append(db_bin)
            
        db.add_all(db_bins)
        db.commit()

        for b in db_bins:
            db.refresh(b)

        # ── Routes ──────────────────────────────────────────────
        # Create active routes for today for Collector 1 and Collector 3 (representing different zones)
        today = date.today()
        
        # Route 1 - Zone 1 North Route for Collector 1
        route1_bins = [b for b in db_bins if b.zone_id == zone1.id][:5] # Take 5 bins
        route1 = Route(
            name="Zone 1 Morning Collection",
            collector_id=collectors[0].id,
            zone_id=zone1.id,
            date=today,
            total_distance_km=8.5,
            estimated_duration_min=90,
            status=RouteStatus.planned,
            optimized=True
        )
        db.add(route1)
        db.commit()
        db.refresh(route1)

        route1_stops = []
        for idx, route_bin in enumerate(route1_bins, 1):
            stop = RouteStop(
                route_id=route1.id,
                bin_id=route_bin.id,
                sequence=idx,
                status="pending"
            )
            route1_stops.append(stop)

        # Route 2 - Zone 3 East Express for Collector 3
        route2_bins = [b for b in db_bins if b.zone_id == zone3.id][:4] # Take 4 bins
        route2 = Route(
            name="East Airport Express",
            collector_id=collectors[2].id,
            zone_id=zone3.id,
            date=today,
            total_distance_km=6.2,
            estimated_duration_min=65,
            status=RouteStatus.in_progress, # Set as in progress
            optimized=True
        )
        db.add(route2)
        db.commit()
        db.refresh(route2)

        route2_stops = []
        for idx, route_bin in enumerate(route2_bins, 1):
            stop = RouteStop(
                route_id=route2.id,
                bin_id=route_bin.id,
                sequence=idx,
                # Simulate the first bin as collected
                status="collected" if idx == 1 else "pending", 
                waste_collected_kg=random.uniform(15.0, 45.0) if idx == 1 else None,
                actual_arrival=datetime.now(timezone.utc) if idx == 1 else None
            )
            route2_stops.append(stop)

        db.add_all(route1_stops + route2_stops)
        db.commit()

        # ── Recyclers ──────────────────────────────────────────────
        recyclers = [
            Recycler(
                name="GreenCycle Chhattisgarh",
                contact_person="Ramesh Kumar",
                phone="9876543210",
                email="recycler1@smartwaste.com",
                address="Phase 1, Siltara Industrial Area, Raipur",
                accepted_types=["PET", "HDPE"],
                price_per_kg=12.50,
                min_quantity_kg=50.0,
                zone_id=zone1.id,
                is_active=True,
                latitude=21.3200,
                longitude=81.6800,
            ),
            Recycler(
                name="Bhanpuri Metal & Scraps",
                contact_person="Anita Desai",
                phone="9876543211",
                email="sales@bhanpuriscraps.com",
                address="Near Transport Nagar, Bhanpuri",
                accepted_types=["Metal", "Glass", "PVC"],
                price_per_kg=22.00,
                min_quantity_kg=20.0,
                zone_id=zone2.id,
                is_active=True,
                latitude=21.2100,
                longitude=81.3900,
            ),
            Recycler(
                name="Urla Eco Recyclers",
                contact_person="Vikram Singh",
                phone="9876543212",
                email="info@urlaeco.com",
                address="Urla Industrial Estate, Raipur",
                accepted_types=["Mixed Plastic", "e-Waste"],
                price_per_kg=9.75,
                min_quantity_kg=100.0,
                zone_id=zone3.id,
                is_active=True,
                latitude=21.2700,
                longitude=81.5500,
            ),
            Recycler(
                name="Nava Raipur Paper Mills",
                contact_person="Sunita Sharma",
                phone="9876543213",
                email="purchasing@navapaper.in",
                address="Sector 30 Industrial Zone, Nava Raipur",
                accepted_types=["Cardboard", "Paper", "Organic"],
                price_per_kg=6.00,
                min_quantity_kg=50.0,
                zone_id=zone4.id,
                is_active=True,
                latitude=21.1300,
                longitude=81.7200,
            )
        ]
        
        db.add_all(recyclers)
        db.commit()

        print("✓ Nava Raipur database seed complete with 4 Zones!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
