import os
from PIL import Image
import numpy as np
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
from app.services.utils import preprocess_image
import cv2

def test_services():
    print("=== Testing Services ===")
    
    # Initialize services
    print("\n1. Initializing services...")
    classifier = Classifier()
    video_processor = VideoProcessor()
    print("✓ Services initialized")
    
    # Create test image
    print("\n2. Creating test image...")
    test_image = Image.new('RGB', (100, 100), color='red')
    print("✓ Test image created")
    
    # Test image classification
    print("\n3. Testing image classification...")
    try:
        result = classifier.predict_image(test_image)
        print(f"✓ Classification result: {result}")
    except Exception as e:
        print(f"✗ Classification failed: {str(e)}")
    
    # Test video processing
    print("\n4. Testing video processing...")
    try:
        # Create a simple test video
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter('test_video.mp4', fourcc, 20.0, (640,480))
        frame = np.zeros((480,640,3), dtype=np.uint8)
        frame[:,:,2] = 255  # Red frame
        out.write(frame)
        out.release()
        
        # Process video
        frame = video_processor.extract_frame_from_bytes(open('test_video.mp4', 'rb').read())
        if frame is not None:
            print("✓ Video frame extracted")
            processed_frame = video_processor.process_frame(frame)
            print("✓ Frame processed")
        else:
            print("✗ Failed to extract frame")
            
        # Clean up
        os.remove('test_video.mp4')
    except Exception as e:
        print(f"✗ Video processing failed: {str(e)}")
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_services() 