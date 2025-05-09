/**
 * Custom hook for processing video files with frame extraction and real-time classification.
 * This hook manages video loading, frame extraction, and integration with the polling mechanism.
 * 
 * @param {number} frameRate - Number of frames to process per second (default: 5)
 * @returns {Object} Video processing controls and state
 * @property {File|null} videoFile - The currently loaded video file
 * @property {number} currentTime - Current playback time in seconds
 * @property {number} duration - Total duration of the video in seconds
 * @property {boolean} isPlaying - Whether the video is currently playing
 * @property {boolean} isPolling - Whether frame processing is active
 * @property {Function} loadVideo - Load a video file for processing
 * @property {Function} startProcessing - Start frame processing
 * @property {Function} stopProcessing - Stop frame processing
 * @property {Function} seekTo - Seek to a specific time in the video
 * @property {Function} cleanup - Clean up resources
 * 
 * @example
 * const {
 *   loadVideo,
 *   startProcessing,
 *   stopProcessing,
 *   isPlaying,
 *   currentTime,
 *   duration
 * } = useVideoFileProcessor(5);
 * 
 * // Load a video file
 * const handleFileSelect = (event) => {
 *   const file = event.target.files[0];
 *   loadVideo(file);
 * };
 * 
 * // Start processing
 * const handleStart = () => {
 *   startProcessing();
 * };
 * 
 * // Stop processing
 * const handleStop = () => {
 *   stopProcessing();
 * };
 */
import { useState, useCallback, useRef } from 'react';
import usePolling from './usePolling';

const useVideoFileProcessor = (frameRate = 5) => {
  const [videoFile, setVideoFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const { startPolling, stopPolling, isPolling } = usePolling(frameRate);

  /**
   * Load a video file and prepare it for processing
   * @param {File} file - The video file to load
   */
  const loadVideo = useCallback((file) => {
    if (!file) return;
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setVideoFile(file);
      videoRef.current = video;
    };

    video.onerror = (error) => {
      console.error('Error loading video:', error);
      setVideoFile(null);
      setDuration(0);
    };
  }, []);

  /**
   * Capture a frame from the video at the specified time
   * @param {number} time - Time in seconds to capture the frame
   * @returns {Promise<string|null>} Base64 encoded image data or null if capture fails
   */
  const captureFrame = useCallback((time) => {
    if (!videoRef.current) return null;

    return new Promise((resolve) => {
      const video = videoRef.current;
      video.currentTime = time;

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const frameData = canvas.toDataURL('image/jpeg');
        canvas.remove();
        resolve(frameData);
      };

      video.onerror = (error) => {
        console.error('Error capturing frame:', error);
        resolve(null);
      };
    });
  }, []);

  /**
   * Start processing frames from the video
   */
  const startProcessing = useCallback(() => {
    if (!videoRef.current || isPlaying) return;

    setIsPlaying(true);
    startPolling(async () => {
      const frame = await captureFrame(currentTime);
      setCurrentTime(prev => {
        const next = prev + (1 / frameRate);
        return next >= duration ? 0 : next;
      });
      return frame;
    });
  }, [captureFrame, currentTime, duration, frameRate, isPlaying, startPolling]);

  /**
   * Stop processing frames
   */
  const stopProcessing = useCallback(() => {
    setIsPlaying(false);
    stopPolling();
  }, [stopPolling]);

  /**
   * Seek to a specific time in the video
   * @param {number} time - Time in seconds to seek to
   */
  const seekTo = useCallback((time) => {
    if (!videoRef.current) return;
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  }, [duration]);

  /**
   * Clean up resources
   */
  const cleanup = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current = null;
    }
    stopProcessing();
  }, [stopProcessing]);

  return {
    videoFile,
    currentTime,
    duration,
    isPlaying,
    isPolling,
    loadVideo,
    startProcessing,
    stopProcessing,
    seekTo,
    cleanup,
  };
};

export default useVideoFileProcessor; 