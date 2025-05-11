import torch
import numpy as np
from PIL import Image
from typing import Dict, Union
from .utils import preprocess_image
from ultralytics import YOLO


class Classifier:
    def __init__(self, model_path='models/best.pt'):
        """
        Initialize classifier with YOLOv5 model.

        Args:
            model_path: Path to the model weights file
        """
        try:
            self.model = YOLO(model_path)  # Load custom model
        except Exception as e:
            print(f"Failed to load custom model: {e}")
            print("Loading default YOLOv5s model...")
            self.model = YOLO('backend/yolov5s.pt')  # Make sure the fallback model path is correct
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
        try:
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
        except Exception as e:
            return {
                "classification": "Error",
                "confidence": 0.0,
                "error": str(e)
            }

    def predict_frame(self, frame: np.ndarray) -> Dict[str, Union[str, float]]:
        """
        Predict classification for a video frame.

        Args:
            frame: numpy array of frame (RGB format)

        Returns:
            Dictionary containing classification and confidence
        """
        try:
            # Convert numpy array to PIL Image
            image = Image.fromarray(frame)

            # Use predict_image method
            return self.predict_image(image)
        except Exception as e:
            return {
                "classification": "Error",
                "confidence": 0.0,
                "error": str(e)
            }

    def batch_predict(self, images: list[Union[bytes, str, Image.Image]]) -> list[Dict[str, Union[str, float]]]:
        """
        Batch predict multiple images.

        Args:
            images: List of images in bytes, base64 string, or PIL Image format

        Returns:
            List of prediction results
        """
        try:
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
        except Exception as e:
            return [{
                "classification": "Error",
                "confidence": 0.0,
                "error": str(e)
            }]
