from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import base64
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
from app.services.utils import preprocess_image
from pydantic import BaseModel

class FrameData(BaseModel):
    frame: str  # Base64 encoded image data

router = APIRouter()
classifier = Classifier()
video_processor = VideoProcessor()

@router.post("/image")
async def classify_image(file: UploadFile = File(...)):
    """
    Classify a single image
    """
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")
        contents = await file.read()
        print(f"File size: {len(contents)} bytes")
        
        result = classifier.predict_image(contents)
        print(f"Classification result: {result}")
        
        return {
            "status": "success",
            "data": {
                "classification": result["classification"],
                "confidence": result["confidence"],
                "processedAt": result.get("processedAt")
            }
        }
    except Exception as e:
        print(f"Error in classify_image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/frame")
async def classify_frame(frame_data: FrameData):
    """
    Classify a single frame from video/webcam
    """
    try:
        # Remove data URL prefix if present
        if frame_data.frame.startswith('data:image'):
            frame_data.frame = frame_data.frame.split(',')[1]
        
        # Decode base64
        try:
            image_data = base64.b64decode(frame_data.frame)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")

        result = classifier.predict_image(image_data)
        return {
            "status": "success",
            "data": {
                "classification": result["classification"],
                "confidence": result["confidence"],
                "processedAt": result.get("processedAt")
            }
        }
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
        
        return {
            "status": "success",
            "data": {
                "classification": result["classification"],
                "confidence": result["confidence"],
                "processedAt": result.get("processedAt")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 