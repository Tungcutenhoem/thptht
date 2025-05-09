from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import base64
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
from app.services.utils import preprocess_image

router = APIRouter()
classifier = Classifier()
video_processor = VideoProcessor()

@router.post("/image")
async def classify_image(file: UploadFile = File(...)):
    """
    Classify a single image
    """
    try:
        contents = await file.read()
        result = classifier.predict_image(contents)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/frame")
async def classify_frame(frame_data: str):
    """
    Classify a single frame from video/webcam
    """
    try:
        result = classifier.predict_image(frame_data)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/video")
async def classify_video(file: UploadFile = File(...)):
    """
    Process video file and return classifications for key frames
    """
    try:
        contents = await file.read()
        # Extract first frame for testing
        frame = video_processor.extract_frame_from_bytes(contents)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid video file")
            
        # Process frame
        processed_frame = video_processor.process_frame(frame)
        result = classifier.predict_image(processed_frame)
        
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 