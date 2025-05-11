from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.classification_result import ClassificationResult
from app.database.session import SessionLocal
from app.schemas.result import ClassificationResultResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    try:
        total_users = db.query(User).count()
        total_classifications = db.query(ClassificationResult).count()
        return {
            "total_users": total_users,
            "total_classifications": total_classifications
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/data", response_model=ClassificationResultResponse)
async def get_classification_data(db: Session = Depends(get_db)):
    try:
        classification_data = db.query(ClassificationResult).all()
        return classification_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
