import cv2
import numpy as np
from typing import Generator, Tuple, Optional
from .utils import preprocess_image
from PIL import Image
import io
import tempfile
import os

class VideoProcessor:
    def __init__(self, frame_skip: int = 5):
        """
        Initialize video processor.
        
        Args:
            frame_skip: Number of frames to skip between processing
        """
        self.frame_skip = frame_skip

    def process_video_file(self, video_path: str) -> Generator[Tuple[np.ndarray, int], None, None]:
        """
        Process video file and yield frames for classification.
        
        Args:
            video_path: Path to video file
            
        Yields:
            Tuple of (frame, frame_number)
        """
        cap = cv2.VideoCapture(video_path)
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % self.frame_skip == 0:
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                yield frame_rgb, frame_count
                
            frame_count += 1
            
        cap.release()

    def process_frame(self, frame: np.ndarray) -> Image.Image:
        """
        Process a single frame for classification.
        
        Args:
            frame: numpy array of frame (RGB format)
            
        Returns:
            PIL Image ready for classification
        """
        # Convert numpy array to PIL Image
        pil_image = Image.fromarray(frame)
        
        # Preprocess image
        processed_image = preprocess_image(pil_image)
        
        return processed_image

    def extract_frame_from_bytes(self, video_bytes: bytes) -> Optional[np.ndarray]:
        """
        Extract first frame from video bytes.
        
        Args:
            video_bytes: Video file in bytes
            
        Returns:
            First frame as numpy array or None if failed
        """
        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            temp_file.write(video_bytes)
            temp_path = temp_file.name
        
        try:
            # Read video from temporary file
            cap = cv2.VideoCapture(temp_path)
            if not cap.isOpened():
                return None
                
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                return None
                
            # Convert BGR to RGB
            return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        finally:
            # Clean up temporary file
            os.unlink(temp_path) 