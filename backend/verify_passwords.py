import bcrypt
from sqlalchemy import text
from database import engine

# Re-hash all users with fresh bcrypt hashes
password_map = {
    "admin@smartwaste.com":       "Admin@123",
    "subadmin1@smartwaste.com":   "Sub@123",
    "subadmin2@smartwaste.com":   "Sub@123",
    "shg1@smartwaste.com":        "SHG@123",
    "shg2@smartwaste.com":        "SHG@123",
    "shg3@smartwaste.com":        "SHG@123",
    "collector1@smartwaste.com":  "Col@123",
    "collector2@smartwaste.com":  "Col@123",
}

with engine.begin() as conn:
    for email, pw in password_map.items():
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pw.encode("utf-8"), salt).decode("utf-8")
        conn.execute(
            text("UPDATE users SET hashed_password = :h WHERE email = :e"),
            {"h": hashed, "e": email}
        )
        # Verify immediately
        ok = bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
        print(f"  {'OK' if ok else 'FAIL'}  {email}")

print("\nAll passwords updated and verified!")
