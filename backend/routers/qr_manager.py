from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserRole
from services.auth_service import require_role
from pydantic import BaseModel
import qrcode
from fpdf import FPDF
import io

router = APIRouter(prefix="/api/admin/qr", tags=["QR Manager"])

class QRStatusUpdate(BaseModel):
    house_id: str
    status: str

@router.patch("/status")
def update_qr_status(
    payload: QRStatusUpdate,
    current_user: User = Depends(require_role("admin", "sub_admin")),
    db: Session = Depends(get_db)
):
    valid_statuses = ["active", "damaged", "stolen", "locked"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    citizen = db.query(User).filter(User.house_id == payload.house_id, User.is_citizen == True).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    
    citizen.qr_status = payload.status
    db.commit()
    return {"message": f"QR status updated to {payload.status}"}

@router.get("/citizens")
def get_citizens_by_ward(
    ward_no: int = Query(...),
    current_user: User = Depends(require_role("admin", "sub_admin")),
    db: Session = Depends(get_db)
):
    citizens = db.query(User).filter(User.ward_no == ward_no, User.is_citizen == True).all()
    return [{
        "house_id": c.house_id,
        "full_name": c.full_name,
        "qr_status": c.qr_status,
        "lat": c.lat,
        "lng": c.lng,
        "socio_category": c.socio_category
    } for c in citizens]

@router.get("/bulk_pdf")
def generate_bulk_pdf(
    ward_no: int = Query(...),
    current_user: User = Depends(require_role("admin", "sub_admin")),
    db: Session = Depends(get_db)
):
    citizens = db.query(User).filter(User.ward_no == ward_no, User.is_citizen == True).all()
    if not citizens:
        raise HTTPException(status_code=404, detail="No citizens found in this ward")

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=10)

    # Grid settings
    cols = 3
    col_width = 190 / cols
    row_height = 60
    
    x_start = 10
    y_start = 10
    x, y = x_start, y_start

    for index, citizen in enumerate(citizens):
        # Generate QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(citizen.qr_hash)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save qr to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr)
        img_byte_arr.seek(0)
        
        # Calculate position
        if index > 0 and index % cols == 0:
            x = x_start
            y += row_height
            if y + row_height > 280:
                pdf.add_page()
                y = y_start

        # Place image
        pdf.image(img_byte_arr, x=x + 10, y=y, w=40, h=40)
        
        # Place text
        pdf.set_xy(x, y + 42)
        pdf.cell(w=col_width, h=5, text=f"House ID: {citizen.house_id}", align="C")
        pdf.set_xy(x, y + 47)
        name_str = citizen.full_name[:20] + "..." if len(citizen.full_name) > 20 else citizen.full_name
        pdf.cell(w=col_width, h=5, text=name_str, align="C")

        x += col_width

    # Output pdf to bytes
    pdf_bytes = pdf.output(dest="S").encode("latin1")
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes), 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=Ward_{ward_no}_QRs.pdf"}
    )
