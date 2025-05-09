import React, { useState } from 'react';
import { useAppState } from './contexts/AppStateContext';
import useWebcam from './hooks/useWebcam';
import useVideoFileProcessor from './hooks/useVideoFileProcessor';
import classificationService from './services/classificationService';

function App() {
  const { state, dispatch } = useAppState();
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Initialize hooks
  const {
    startWebcam,
    stopWebcam,
    startProcessing: startWebcamProcessing,
    stopProcessing: stopWebcamProcessing,
    isActive: isWebcamActive,
    error: webcamError
  } = useWebcam(5);

  const {
    loadVideo,
    startProcessing: startVideoProcessing,
    stopProcessing: stopVideoProcessing,
    isPlaying: isVideoPlaying,
    currentTime,
    duration,
    cleanup: cleanupVideo
  } = useVideoFileProcessor(5);

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    dispatch({ type: 'SET_CURRENT_FILE', payload: file });

    if (file.type.startsWith('video/')) {
      dispatch({ type: 'SET_INPUT_TYPE', payload: 'video' });
      loadVideo(file);
    } else if (file.type.startsWith('image/')) {
      dispatch({ type: 'SET_INPUT_TYPE', payload: 'image' });
      try {
        dispatch({ type: 'SET_PROCESSING', payload: true });
        const result = await classificationService.classifyImage(file);
        dispatch({ type: 'SET_CLASSIFICATION_RESULT', payload: result });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };

  // Handle webcam controls
  const handleWebcamStart = async () => {
    await startWebcam();
    startWebcamProcessing();
  };

  const handleWebcamStop = () => {
    stopWebcamProcessing();
    stopWebcam();
  };

  // Handle video controls
  const handleVideoStart = () => {
    startVideoProcessing();
  };

  const handleVideoStop = () => {
    stopVideoProcessing();
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupVideo();
      stopWebcam();
    };
  }, [cleanupVideo, stopWebcam]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Food Freshness Detection</h1>
      
      {/* Input Type Selection */}
      <div className="mb-4">
        <button
          onClick={() => dispatch({ type: 'SET_INPUT_TYPE', payload: 'image' })}
          className={`mr-2 px-4 py-2 rounded ${state.inputType === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Image
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_INPUT_TYPE', payload: 'video' })}
          className={`mr-2 px-4 py-2 rounded ${state.inputType === 'video' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Video
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_INPUT_TYPE', payload: 'webcam' })}
          className={`px-4 py-2 rounded ${state.inputType === 'webcam' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Webcam
        </button>
      </div>

      {/* File Input */}
      {state.inputType === 'image' || state.inputType === 'video' ? (
        <div className="mb-4">
          <input
            type="file"
            accept={state.inputType === 'image' ? 'image/*' : 'video/*'}
            onChange={handleFileSelect}
            className="block w-full"
          />
        </div>
      ) : null}

      {/* Webcam Controls */}
      {state.inputType === 'webcam' && (
        <div className="mb-4">
          {!isWebcamActive ? (
            <button
              onClick={handleWebcamStart}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Start Webcam
            </button>
          ) : (
            <button
              onClick={handleWebcamStop}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Stop Webcam
            </button>
          )}
        </div>
      )}

      {/* Video Controls */}
      {state.inputType === 'video' && selectedFile && (
        <div className="mb-4">
          {!isVideoPlaying ? (
            <button
              onClick={handleVideoStart}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Start Processing
            </button>
          ) : (
            <button
              onClick={handleVideoStop}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Stop Processing
            </button>
          )}
          {duration > 0 && (
            <div className="mt-2">
              Progress: {Math.round(currentTime)}s / {Math.round(duration)}s
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {state.error}
        </div>
      )}

      {/* Webcam Error */}
      {webcamError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {webcamError}
        </div>
      )}

      {/* Results Display */}
      {state.classificationResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-bold mb-2">Classification Result</h2>
          <p>Status: {state.classificationResult.classification}</p>
          <p>Confidence: {(state.classificationResult.confidence * 100).toFixed(2)}%</p>
        </div>
      )}

      {/* Loading State */}
      {state.isProcessing && (
        <div className="mt-4">
          Processing...
        </div>
      )}
    </div>
  );
}

export default App;
