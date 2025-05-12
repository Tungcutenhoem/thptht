import base64
import io
from PIL import Image
import numpy as np
from typing import Union, Tuple

def decode_base64_image(base64_string: str) -> bytes:
    """Decode base64 image string to bytes."""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    return base64.b64decode(base64_string)

def resize_image(image: Union[Image.Image, bytes], target_size: Tuple[int, int] = (640, 640)) -> Image.Image:
    """Resize image while maintaining aspect ratio."""
    if isinstance(image, bytes):
        image = Image.open(io.BytesIO(image))
    
    # Calculate aspect ratio
    width, height = image.size
    aspect_ratio = width / height
    
    if width > height:
        new_width = target_size[0]
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = target_size[1]
        new_width = int(new_height * aspect_ratio)
    
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)

def preprocess_image(image: Union[Image.Image, bytes, str]) -> Image.Image:
    """Preprocess image for model inference."""
    if isinstance(image, bytes):
        image = Image.open(io.BytesIO(image)).convert("RGB")
    elif isinstance(image, str):
        try:
            # Nếu là base64 string
            image_data = base64.b64decode(image)
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
        except Exception:
            # Nếu không phải base64, giả định là đường dẫn file
            image = Image.open(image).convert("RGB")
    elif isinstance(image, Image.Image):
        image = image.convert("RGB")
    else:
        raise ValueError("Định dạng ảnh không hỗ trợ")
    
    # Resize image
    image = resize_image(image)
    
    return image

def image_to_bytes(image: Image.Image, format: str = 'JPEG') -> bytes:
    """Convert PIL Image to bytes."""
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format)
    return img_byte_arr.getvalue() 