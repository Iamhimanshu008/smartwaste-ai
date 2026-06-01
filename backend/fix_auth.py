import os
import re

ROUTER_FILES = [
    "admin.py",
    "iot_telemetry.py",
    "store.py",
    "ai_analytics.py",
    "gamification.py",
    "collector_management.py",
    "panchayat.py",
    "qr_manager.py",
    "points.py",
    "sync.py"
]

def main():
    base_dir = r"c:\Users\himan\projects\Smart Waste AI V2\backend\routers"
    
    # 1. First add the IOT_API_KEY logic to iot_telemetry.py
    iot_path = os.path.join(base_dir, "iot_telemetry.py")
    if os.path.exists(iot_path):
        with open(iot_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Add the import and key verification function if missing
        if "def verify_iot_key" not in content:
            imports_str = """
import os
from fastapi import Header
from services.auth_service import require_role

IOT_API_KEY = os.getenv("IOT_API_KEY", "smartwaste-iot-secret-2026")

def verify_iot_key(x_iot_api_key: str = Header(...)):
    if x_iot_api_key != IOT_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid IoT device key")
    return x_iot_api_key
"""
            # Insert after the last import
            parts = content.split("\n\n", 1)
            content = parts[0] + "\n" + imports_str + "\n" + parts[1]
            
            # Now modify the heartbeat endpoint
            # change: def heartbeat(data: IoTHeartbeat, db: Session = Depends(get_db)):
            # to: def heartbeat(data: IoTHeartbeat, db: Session = Depends(get_db), api_key: str = Depends(verify_iot_key)):
            content = re.sub(
                r'(def heartbeat\(.*?, db: Session = Depends\(get_db\))(.*?\):)',
                r'\1, api_key: str = Depends(verify_iot_key)\2',
                content
            )
            with open(iot_path, "w", encoding="utf-8") as f:
                f.write(content)
                
    # 2. Iterate through all files and add require_role imports and dependencies
    for fname in ROUTER_FILES:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
            
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Add import if needed
        if "from services.auth_service import require_role" not in content and "require_role" not in content:
            # check if there's an existing services.auth_service import
            if "from services.auth_service import" in content:
                content = content.replace("from services.auth_service import ", "from services.auth_service import require_role, ")
            else:
                content = "from services.auth_service import require_role\nfrom models.user import User\n" + content
                
        # Regex to find endpoint definitions
        # Look for @router.something("/admin...")
        # Then the def my_func(db: Session = Depends(get_db)):
        
        # Let's do a pass where we find `async def` or `def` lines that are endpoints.
        # It's easier to find `@router.(get|post|put|delete|patch)` followed by the def
        
        # We will split by @router.
        blocks = content.split("@router.")
        new_blocks = [blocks[0]]
        
        for block in blocks[1:]:
            # The block starts with get("/admin/...")\ndef func(db: Session = Depends(get_db)):
            # Check if this route is admin
            if '"/admin/' in block or "'/admin/" in block or '"/api/admin/' in block or "prefix='/admin'" in block:
                # Need to check if current_user is already a parameter
                if "current_user: User = Depends(require_role" not in block and "current_user: User = Depends(get_current_user)" not in block:
                    # find the def signature
                    # def func_name(...):
                    def_match = re.search(r'(async def|def) (\w+)\((.*?)\):', block, re.DOTALL)
                    if def_match:
                        sig = def_match.group(3)
                        # determine if admin or admin+sub_admin
                        if fname in ["panchayat.py", "collector_management.py", "gamification.py"]: # Examples of admin+subadmin
                            req = 'current_user: User = Depends(require_role("admin", "sub_admin"))'
                        else:
                            req = 'current_user: User = Depends(require_role("admin"))'
                            
                        new_sig = sig
                        if new_sig.strip():
                            new_sig += f", {req}"
                        else:
                            new_sig = req
                            
                        # Replace in block
                        new_block = block[:def_match.start(3)] + new_sig + block[def_match.end(3):]
                        block = new_block
            new_blocks.append(block)
            
        final_content = "@router.".join(new_blocks)
        
        if final_content != content:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(final_content)
                print(f"Updated {fname}")

if __name__ == "__main__":
    main()
