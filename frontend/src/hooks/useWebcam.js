/**
 * Custom hook for handling webcam stream with real-time frame processing.
 * This hook manages webcam access, frame capture, and integration with the polling mechanism.
 * 
 * @param {number} frameRate - Number of frames to process per second (default: 5)
 * @returns {Object} Webcam controls and state
 * @property {MediaStream|null} stream - The active webcam stream
 * @property {string|null} error - Error message if webcam access fails
 * @property {boolean} isActive - Whether the webcam is currently active
 * @property {boolean} isPolling - Whether frame processing is active
 * @property {boolean} isProcessing - Whether frame processing is in progress
 * @property {string|null} classificationResult - Result of frame classification
 * @property {Function} startWebcam - Start the webcam stream
 * @property {Function} stopWebcam - Stop the webcam stream
 * @property {Function} startProcessing - Start frame processing
 * @property {Function} stopProcessing - Stop frame processing
 * 
 * @example
 * const {
 *   startWebcam,
 *   stopWebcam,
 *   startProcessing,
 *   stopProcessing,
 *   isActive,
 *   error,
 *   isProcessing,
 *   classificationResult
 * } = useWebcam(5);
 * 
 * // Start webcam
 * const handleStart = async () => {
 *   await startWebcam();
 *   startProcessing();
 * };
 * 
 * // Stop webcam
 * const handleStop = () => {
 *   stopProcessing();
 *   stopWebcam();
 * };
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import usePolling from './usePolling';
import classificationService from '../services/classificationService';

const useWebcam = (frameRate = 5) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const videoRef = useRef(null);
  const { startPolling, stopPolling, isPolling } = usePolling(frameRate);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startWebcam = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt của bạn không hỗ trợ getUserMedia API');
      }

      // Kiểm tra xem videoRef có tồn tại không
      if (!videoRef.current) {
        console.error('Video element chưa được tạo');
        throw new Error('Video element chưa được tạo');
      }

      console.log('1. Đang yêu cầu quyền truy cập webcam...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      });

      console.log('2. Đã nhận được stream từ webcam');
      
      // Gán stream vào video element
      console.log('3. Đang gán stream vào video element');
      videoRef.current.srcObject = mediaStream;

      // Đợi video element sẵn sàng
      await new Promise((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Video element không tồn tại'));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout khi load video'));
        }, 5000);

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          console.log('4. Video metadata đã được load');
          resolve();
        };

        videoRef.current.onerror = (error) => {
          clearTimeout(timeoutId);
          console.error('Lỗi khi load video:', error);
          reject(new Error('Không thể load video'));
        };
      });

      try {
        console.log('5. Đang bắt đầu play video');
        await videoRef.current.play();
        console.log('6. Video đã bắt đầu play thành công');
      } catch (playError) {
        console.error('Lỗi khi play video:', playError);
        throw playError;
      }

      setStream(mediaStream);
      setIsActive(true);
      setError(null);

    } catch (err) {
      console.error('Lỗi khi truy cập webcam:', err);
      setError('Không thể truy cập webcam: ' + err.message);
      setIsActive(false);
      
      // Dọn dẹp nếu có lỗi
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const stopWebcam = useCallback(() => {
    console.log('Đang dừng webcam...');
    try {
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log('Đang dừng track:', track.kind);
          track.stop();
        });
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsActive(false);
      stopPolling();
      setClassificationResult(null);
      console.log('Webcam đã được dừng');
    } catch (err) {
      console.error('Lỗi khi dừng webcam:', err);
      setError('Lỗi khi dừng webcam: ' + err.message);
    }
  }, [stream, stopPolling]);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current) return null;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      const file = new File([blob], 'webcam-frame.jpg', { type: 'image/jpeg' });
      
      setIsProcessing(true);
      try {
        console.log('Đang gửi frame để phân tích...');
        const result = await classificationService.classifyImage(file);
        console.log('Kết quả phân tích:', result);
        setClassificationResult(result);
      } catch (error) {
        console.error('Lỗi khi phân tích frame:', error);
        setError('Lỗi khi phân tích frame: ' + error.message);
      } finally {
        setIsProcessing(false);
      }

      canvas.remove();
      return blob;
    } catch (error) {
      console.error('Lỗi khi xử lý frame:', error);
      setError('Lỗi khi xử lý frame: ' + error.message);
      return null;
    }
  }, []);

  const startProcessing = useCallback(() => {
    if (!videoRef.current || !isActive) return;
    console.log('Bắt đầu xử lý frame...');
    startPolling(captureFrame);
  }, [captureFrame, isActive, startPolling]);

  const stopProcessing = useCallback(() => {
    console.log('Dừng xử lý frame...');
    stopPolling();
    setClassificationResult(null);
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    stream,
    error,
    isActive,
    isPolling,
    isProcessing,
    classificationResult,
    videoRef,
    startWebcam,
    stopWebcam,
    startProcessing,
    stopProcessing
  };
};

export default useWebcam;
