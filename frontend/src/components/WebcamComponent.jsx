import React, { useEffect, useState } from 'react';
import useWebcam from '../hooks/useWebcam';

const WebcamComponent = ({ onError }) => {
  const {
    startWebcam,
    stopWebcam,
    startProcessing: startWebcamProcessing,
    stopProcessing: stopWebcamProcessing,
    isActive: isWebcamActive,
    error: webcamError,
    videoRef,
    isProcessing,
    classificationResult,
    stream
  } = useWebcam(5);

  const [localIsActive, setLocalIsActive] = useState(false);

  // Kiểm tra trạng thái webcam
  useEffect(() => {
    const checkWebcamStatus = () => {
      const hasStream = videoRef.current?.srcObject?.active;
      const hasVideo = videoRef.current?.readyState === 4;
      console.log('Webcam status:', { hasStream, hasVideo, isWebcamActive });
      setLocalIsActive(hasStream && hasVideo);
    };

    // Kiểm tra ngay khi component mount
    checkWebcamStatus();

    // Thêm event listener cho video element
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', checkWebcamStatus);
      videoRef.current.addEventListener('playing', checkWebcamStatus);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', checkWebcamStatus);
        videoRef.current.removeEventListener('playing', checkWebcamStatus);
      }
    };
  }, [videoRef.current, isWebcamActive]);

  const handleWebcamStart = async () => {
    try {
      console.log("Bắt đầu khởi tạo webcam...");
      await startWebcam();
      
      // Đợi một chút để video element được khởi tạo
      setTimeout(() => {
        const hasStream = videoRef.current?.srcObject?.active;
        const hasVideo = videoRef.current?.readyState === 4;
        console.log('Webcam status after start:', { hasStream, hasVideo });
        setLocalIsActive(hasStream && hasVideo);
        
        if (hasStream && hasVideo) {
          console.log("Bắt đầu xử lý webcam...");
          startWebcamProcessing();
        }
      }, 1000);
    } catch (err) {
      console.error("Lỗi khi bật webcam:", err);
      setLocalIsActive(false);
      onError(err.message);
    }
  };

  const handleWebcamStop = () => {
    try {
      console.log("Đang tắt webcam...");
      stopWebcamProcessing();
      stopWebcam();
      setLocalIsActive(false);
    } catch (err) {
      console.error("Lỗi khi tắt webcam:", err);
      onError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full max-w-[640px] aspect-video bg-gray-100 rounded shadow overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="rounded"
        />
        {!localIsActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <span className="text-white">Webcam chưa được bật</span>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        {!localIsActive ? (
          <button 
            onClick={handleWebcamStart} 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Bật Webcam
          </button>
        ) : (
          <button 
            onClick={handleWebcamStop} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Tắt Webcam
          </button>
        )}
      </div>
      {webcamError && (
        <div className="text-red-500 text-sm mt-2">
          {webcamError}
        </div>
      )}
      {isProcessing && (
        <div className="text-gray-700 text-sm mt-2">
          Đang xử lý...
        </div>
      )}
      {classificationResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded w-full">
          <h2 className="text-xl font-bold mb-2">Kết quả phân tích</h2>
          <p>Trạng thái: {classificationResult.classification}</p>
          <p>Độ tin cậy: {(classificationResult.confidence * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default WebcamComponent; 