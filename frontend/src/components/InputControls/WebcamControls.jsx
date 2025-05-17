import React from 'react';

function WebcamControls({ onCapture }) {
  return (
    <button onClick={onCapture}>Chụp từ webcam</button>
  );
}

export default WebcamControls;
