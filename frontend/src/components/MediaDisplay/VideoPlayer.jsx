import React, { useRef } from 'react';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  return (
    <div>
      <video ref={videoRef} controls src={src} width="500" />
    </div>
  );
}

export default VideoPlayer;
