from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
import tempfile
from PIL import Image
import time
import io
from app.schemas.result import ClassificationResultResponse
from app.services import utils
from datetime import datetime
from fastapi import APIRouter, WebSocket
import cv2
import base64
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import base64

router = APIRouter()
classifier = Classifier()
video_processor = VideoProcessor(frame_skip=0)  # Set frame_skip to 1 to capture every frame for 60fps


@router.post("/analyze_image")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # Dự đoán
    result = classifier.predict_image(contents)

    # Vẽ bbox + label lên ảnh
    draw = ImageDraw.Draw(img)
    bbox = result.get('bounding_box', [])
    if len(bbox) == 4:
        x1, y1, x2, y2 = bbox
        # Vẽ rectangle
        draw.rectangle([x1, y1, x2, y2], outline='lime', width=3)

        # Chuẩn bị label
        label = f"{result['classification']} ({result['confidence'] * 100:.1f}%)"

        # Vẽ label (dùng font mặc định hoặc thêm font nếu cần)
        draw.text((x1, y1 - 20), label, fill='lime')

    # Chuyển ảnh sang bytes để gửi về
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_bytes = buffered.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    return {
        "type": "image_with_info",
        "status": "success",
        "data": {
            "image_base64": img_base64,
            "classification": result["classification"],
            "confidence": result["confidence"],
            "bounding_box": bbox
        }
    }


# ---------------------- Xử lý video từ camera ----------------------

@router.websocket("/ws/camera")
async def websocket_camera(websocket: WebSocket):
    print("WebSocket connection started")
    await websocket.accept()
    try:
        while True:
            # Nhận frame base64 từ client (định dạng chuỗi)
            data = await websocket.receive_text()

            # Giải mã base64 thành bytes
            frame_bytes = base64.b64decode(data)

            # Chuyển bytes thành numpy array (để OpenCV xử lý)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Xử lý frame với model classification (bạn convert frame cho phù hợp)
            result = classifier.predict_frame(frame)

            # Gửi lại kết quả classification dạng JSON
            await websocket.send_json({
                "classification": result["classification"],
                "confidence": result["confidence"],
                "bounding_box": result.get("bounding_box", [])
            })
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()


@router.post("/analyze_video")
async def analyze_video(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Ghi ra file tạm để phân biệt định dạng
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp:
            temp.write(contents)
            temp_path = temp.name

        # Mở video
        cap = cv2.VideoCapture(temp_path)

        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Không thể mở video")

        # Cài đặt frame rate mong muốn (60fps)
        cap.set(cv2.CAP_PROP_FPS, 60)

        # Kiểm tra frame rate thực tế từ video
        fps = cap.get(cv2.CAP_PROP_FPS)
        print(f"Video đang chạy ở {fps} FPS")

        frame_count = 0
        results = []

        while True:
            start_time = time.time()  # Ghi lại thời gian bắt đầu mỗi frame

            # Đọc một frame từ video
            ret, frame = cap.read()
            if not ret:
                break

            # Chuyển frame thành RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Tiền xử lý frame cho mô hình
            processed_frame = video_processor.process_frame(frame_rgb)

            # Dự đoán phân loại cho frame
            result = classifier.predict_image(processed_frame)
            results.append({
                "frameIndex": frame_count,
                "classification": result["classification"],
                "confidence": result["confidence"]
            })
            frame_count += 1

            # Hiển thị kết quả lên cửa sổ video
            cv2.putText(frame, f"Class: {result['classification']} Confidence: {result['confidence']:.2f}",
                        (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow("Video Stream", frame)

            # Tính toán thời gian xử lý và điều chỉnh delay để duy trì 60fps
            elapsed_time = time.time() - start_time
            delay_time = max(1.0 / 60 - elapsed_time, 0)  # Đảm bảo không có độ trễ âm
            time.sleep(delay_time)  # Điều chỉnh độ trễ để duy trì 60fps

            # Dừng khi nhấn phím 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

        return {
            "type": "video",
            "status": "success",
            "totalFramesProcessed": len(results),
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")


@router.post("/frame", response_model=ClassificationResultResponse)
async def classify_frame(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}, content_type={file.content_type}")
    try:
        image_bytes = await file.read()
        image = utils.preprocess_image(image_bytes)  # Phải nhanh, trả PIL Image hoặc ndarray chuẩn
        result = classifier.predict_image(image)

        return ClassificationResultResponse(
            id=0,  # Nếu ko lưu DB
            image_url="",
            classification=result.get("classification") or result.get("label") or "Không xác định",
            confidence=result.get("confidence", 0.0),
            created_at=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý frame: {str(e)}")
