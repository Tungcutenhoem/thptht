from fastapi import APIRouter, HTTPException, Depends
from app.models.user import User
from app.models.classification_result import ClassificationResult
from app.database.session import get_db
from sqlalchemy.orm import Session
from app.core.security import admin_required

router = APIRouter()


@router.post("/stats")
async def get_stats(db: Session = Depends( get_db)):
    try:
        total_users = db.query(User).count()
        total_classifications = db.query(ClassificationResult).count()
        return {
            "total_users": total_users,
            "total_classifications": total_classifications
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
    return {
        "total_users": 0,
        "total_classifications": 0
    }

@router.post("/data")
async def get_classification_data(db: Session = Depends(get_db)):
    try:
        classification_data = db.query(ClassificationResult).all()
        return classification_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
    return []

@router.get("/admin-dashboard")
def admin_dashboard(user: dict = Depends(admin_required)):
    # Endpoint này chỉ cho phép admin truy cập
    return {"message": "Welcome to the admin dashboard"}