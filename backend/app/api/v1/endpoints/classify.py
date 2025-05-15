from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
import tempfile
import imghdr
import cv2
import time
router = APIRouter()
classifier = Classifier()
video_processor = VideoProcessor(frame_skip=0)  # Set frame_skip to 1 to capture every frame for 60fps

@router.post("/analyze_image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Ghi ra file tạm để phân biệt định dạng
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp:
            temp.write(contents)
            temp_path = temp.name

        # Kiểm tra xem có phải ảnh không
        if not imghdr.what(temp_path):
            raise HTTPException(status_code=400, detail="File không phải ảnh.")

        # Đọc và tiền xử lý ảnh
        result = classifier.predict_image(contents)

        return {
            "type": "image",
            "status": "success",
            "data": {
                "classification": result["classification"],
                "confidence": result["confidence"],
                "bounding_box": result.get('boxes', [])
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")


# ---------------------- Xử lý video từ camera ----------------------

@router.post("/analyze_camera")
async def analyze_camera():
    try:
        # Mở camera (thường camera mặc định là chỉ số 0)
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Không thể mở camera")

        # Cài đặt frame rate mong muốn (60fps)
        cap.set(cv2.CAP_PROP_FPS, 60)

        # Kiểm tra frame rate thực tế từ camera
        fps = cap.get(cv2.CAP_PROP_FPS)
        print(f"Camera đang chạy ở {fps} FPS")

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
            cv2.imshow("Camera Stream", frame)

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
            "type": "camera",
            "status": "success",
            "totalFramesProcessed": len(results),
            "results": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")

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
