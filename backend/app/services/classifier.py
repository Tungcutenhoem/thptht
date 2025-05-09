# === services/classifier.py ===
import torch
import numpy as np
from PIL import Image
import io
from typing import Dict, Union, Optional
from .utils import preprocess_image

class Classifier:
    def __init__(self, model_path='models/best.pt'):
        """
        Initialize classifier with YOLOv5 model.
        
        Args:
            model_path: Path to the model weights file
        """
        try:
            self.model = torch.hub.load('ultralytics/yolov5', 'custom', 
                                      path=model_path, 
                                      force_reload=True,  # Force reload để tránh lỗi cache
                                      trust_repo=True)    # Trust repo để tránh warning
        except Exception as e:
            # Fallback to yolov5s if custom model fails
            print(f"Failed to load custom model: {e}")
            print("Loading default YOLOv5s model...")
            self.model = torch.hub.load('ultralytics/yolov5', 'yolov5s', 
                                      pretrained=True, 
                                      force_reload=True,
                                      trust_repo=True)
            
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)

    def predict_image(self, image: Union[bytes, str, Image.Image]) -> Dict[str, Union[str, float]]:
        """
        Predict classification for a single image.
        
        Args:
            image: Image in bytes, base64 string, or PIL Image format
            
        Returns:
            Dictionary containing classification and confidence
        """
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Run inference
        results = self.model(processed_image, size=640)
        
        # Get predictions
        predictions = results.pandas().xyxy[0]
        
        if predictions.empty:
            return {
                "classification": "Không xác định",
                "confidence": 0.0
            }

        # Get top prediction
        top_pred = predictions.iloc[0]
        
        return {
            "classification": top_pred['name'],
            "confidence": round(float(top_pred['confidence']), 2)
        }

    def predict_frame(self, frame: np.ndarray) -> Dict[str, Union[str, float]]:
        """
        Predict classification for a video frame.
        
        Args:
            frame: numpy array of frame (RGB format)
            
        Returns:
            Dictionary containing classification and confidence
        """
        # Convert numpy array to PIL Image
        image = Image.fromarray(frame)
        
        # Use predict_image method
        return self.predict_image(image)

    def batch_predict(self, images: list[Union[bytes, str, Image.Image]]) -> list[Dict[str, Union[str, float]]]:
        """
        Batch predict multiple images.
        
        Args:
            images: List of images in bytes, base64 string, or PIL Image format
            
        Returns:
            List of prediction results
        """
        # Preprocess all images
        processed_images = [preprocess_image(img) for img in images]
        
        # Run batch inference
        results = self.model(processed_images, size=640)
        
        predictions = []
        for result in results.pandas().xyxy:
            if result.empty:
                predictions.append({
                    "classification": "Không xác định",
                    "confidence": 0.0
                })
            else:
                top_pred = result.iloc[0]
                predictions.append({
                    "classification": top_pred['name'],
                    "confidence": round(float(top_pred['confidence']), 2)
                })
                
        return predictions