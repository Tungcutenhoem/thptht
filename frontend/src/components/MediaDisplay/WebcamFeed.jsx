// src/components/WebcamFeed.jsx
import React, { useEffect, useRef, useState } from 'react';

function WebcamFeed({ isWebcamActive }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;

    const startStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam error:', err);
        setError('Không thể truy cập webcam: ' + err.message);
      }
    };

    if (isWebcamActive) {
      startStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isWebcamActive]);

  if (!isWebcamActive) return null;

  return (
    <div className="mt-4">
      {error ? (
        <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          className="w-full max-w-md rounded shadow border"
        />
      )}
    </div>
  );
}

export default WebcamFeed;
