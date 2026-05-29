import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
db_url = os.getenv('DATABASE_URL').replace('postgres://', 'postgresql://')
engine = create_engine(db_url, isolation_level='AUTOCOMMIT')

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'citizen'"))
        print("✅ 'citizen' role added to PostgreSQL ENUM!")
    except Exception as e:
        print("Note:", e)
        
    try:
        conn.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'merchant'"))
        print("✅ 'merchant' role added to PostgreSQL ENUM!")
    except Exception as e:
        print("Note:", e)
