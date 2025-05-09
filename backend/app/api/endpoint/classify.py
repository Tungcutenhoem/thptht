from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from services.video_processor import process_frame_base64
from services.classifier import Classifier

router = APIRouter()
classifier = Classifier()

class FrameInput(BaseModel):
    frameData: str

@router.post("/api/classify/image")
async def classify_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = classifier.predict_image(image_bytes)
        return {"status": "success", "data": result, "message": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/classify/frame")
async def classify_frame(data: FrameInput):
    try:
        result = process_frame_base64(data.frameData)
        return {"status": "success", "data": result, "message": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
