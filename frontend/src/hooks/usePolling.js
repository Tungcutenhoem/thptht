/**
 * Custom hook for handling real-time frame processing with polling mechanism.
 * This hook manages the polling interval, retry logic, and state updates for frame processing.
 * 
 * @param {number} frameRate - Number of frames to process per second (default: 5)
 * @returns {Object} Polling controls and state
 * @property {Function} startPolling - Start polling with the provided frame provider
 * @property {Function} stopPolling - Stop the current polling process
 * @property {boolean} isPolling - Whether polling is currently active
 * 
 * @example
 * const { startPolling, stopPolling, isPolling } = usePolling(5);
 * 
 * // Start polling with a frame provider
 * startPolling(async () => {
 *   const frame = await captureFrame();
 *   return frame;
 * });
 * 
 * // Stop polling
 * stopPolling();
 */
import { useCallback, useRef, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import classificationService from '../services/classificationService';

const usePolling = (frameRate = 5) => { // Default 5 frames per second
  const { state, dispatch } = useAppState();
  const pollingRef = useRef(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  /**
   * Process a single frame through the classification service
   * @param {string} frameData - Base64 encoded image data
   * @private
   */
  const processFrame = useCallback(async (frameData) => {
    if (!frameData) return;

    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      const result = await classificationService.classifyFrame(frameData);
      dispatch({ type: 'SET_CLASSIFICATION_RESULT', payload: result });
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCountRef.current - 1) * 1000;
        setTimeout(() => processFrame(frameData), delay);
      } else {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `Failed to process frame after ${MAX_RETRIES} attempts: ${error.message}` 
        });
        retryCountRef.current = 0;
      }
    }
  }, [dispatch]);

  /**
   * Start polling with the provided frame provider
   * @param {Function} frameProvider - Async function that returns frame data
   */
  const startPolling = useCallback((frameProvider) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const interval = 1000 / frameRate; // Convert frameRate to milliseconds
    pollingRef.current = setInterval(async () => {
      const frame = await frameProvider();
      if (frame) {
        await processFrame(frame);
      }
    }, interval);
  }, [frameRate, processFrame]);

  /**
   * Stop the current polling process
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    startPolling,
    stopPolling,
    isPolling: !!pollingRef.current,
  };
};

export default usePolling; 