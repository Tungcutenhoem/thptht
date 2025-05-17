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
 *   error
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

const useWebcam = (frameRate = 5) => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef(null);
  const { startPolling, stopPolling, isPolling } = usePolling(frameRate);

  const startWebcam = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setIsActive(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error("Lỗi khi play video:", err);
          });
        };
      } else {
        console.warn("⚠ videoRef chưa sẵn sàng khi startWebcam");
      }
    } catch (err) {
      setError('Không thể truy cập webcam: ' + err.message);
      setIsActive(false);
    }
  }, []);



  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stopPolling();
  }, [stream, stopPolling]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;

    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const frameData = canvas.toDataURL('image/jpeg');
      canvas.remove();
      resolve(frameData);
    });
  }, []);

  const startProcessing = useCallback(() => {
    if (!videoRef.current || !isActive) return;
    startPolling(captureFrame);
  }, [captureFrame, isActive, startPolling]);

  const stopProcessing = useCallback(() => {
    stopPolling();
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
    videoRef,
    startWebcam,
    stopWebcam,
    startProcessing,
    stopProcessing,
  };
};

export default useWebcam;
