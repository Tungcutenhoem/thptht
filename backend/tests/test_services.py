import sys
import os
import unittest
from PIL import Image
import numpy as np
import cv2
import base64
from io import BytesIO

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
from app.services.utils import preprocess_image

class TestServices(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures that will be shared across all tests"""
        # Create a simple test image
        cls.test_image = Image.new('RGB', (100, 100), color='red')
        cls.test_image_bytes = BytesIO()
        cls.test_image.save(cls.test_image_bytes, format='JPEG')
        cls.test_image_bytes = cls.test_image_bytes.getvalue()
        
        # Create test video
        cls.test_video_path = os.path.join(os.path.dirname(__file__), 'test_video.mp4')
        cls._create_test_video(cls)

    @classmethod
    def tearDownClass(cls):
        """Clean up test fixtures"""
        if os.path.exists(cls.test_video_path):
            os.remove(cls.test_video_path)

    def _create_test_video(self):
        """Create a simple test video file"""
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(self.test_video_path, fourcc, 20.0, (640,480))
        
        # Write some frames
        for _ in range(30):  # 1.5 seconds of video at 20fps
            frame = np.zeros((480,640,3), dtype=np.uint8)
            frame[:,:,2] = 255  # Red frame
            out.write(frame)
        
        out.release()

    def test_utils_preprocess_image(self):
        """Test image preprocessing"""
        # Test with PIL Image
        processed = preprocess_image(self.test_image)
        self.assertIsInstance(processed, Image.Image)
        
        # Test with bytes
        processed = preprocess_image(self.test_image_bytes)
        self.assertIsInstance(processed, Image.Image)
        
        # Test with base64
        base64_str = base64.b64encode(self.test_image_bytes).decode()
        processed = preprocess_image(base64_str)
        self.assertIsInstance(processed, Image.Image)

    def test_video_processor(self):
        """Test video processing"""
        video_processor = VideoProcessor()
        
        # Test frame extraction
        frame = video_processor.extract_frame_from_bytes(open(self.test_video_path, 'rb').read())
        self.assertIsNotNone(frame)
        self.assertEqual(frame.shape[2], 3)  # RGB channels
        
        # Test video processing
        frames = list(video_processor.process_video_file(self.test_video_path))
        self.assertTrue(len(frames) > 0)
        
        # Test frame processing
        processed_frame = video_processor.process_frame(frame)
        self.assertIsInstance(processed_frame, Image.Image)

    def test_classifier(self):
        """Test classifier"""
        classifier = Classifier()
        
        # Test single image prediction
        result = classifier.predict_image(self.test_image)
        self.assertIn('classification', result)
        self.assertIn('confidence', result)
        
        # Test batch prediction
        results = classifier.batch_predict([self.test_image, self.test_image])
        self.assertEqual(len(results), 2)
        
        # Test frame prediction
        frame = np.array(self.test_image)
        result = classifier.predict_frame(frame)
        self.assertIn('classification', result)
        self.assertIn('confidence', result)

if __name__ == '__main__':
    unittest.main() 