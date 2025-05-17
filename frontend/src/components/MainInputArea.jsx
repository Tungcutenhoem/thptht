// src/components/MainInputArea.jsx

import React, { useState } from 'react';
import InputTypeSelector from './InputControls/InputTypeSelector';
import FileInput from './InputControls/FileInput';
import WebcamControls from './InputControls/WebcamControls';

import ImageViewer from './MediaDisplay/ImageViewer';
import VideoPlayer from './MediaDisplay/VideoPlayer';
import WebcamFeed from './MediaDisplay/WebcamFeed';

function MainInputArea() {
  const [inputType, setInputType] = useState(null);
  const [fileURL, setFileURL] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileURL(url);
    }
  };

  const handleCapture = () => {
    alert('Chụp từ webcam chưa được xử lý ở đây.');
    // sau này bạn có thể xử lý ảnh từ webcam ở đây
  };

  return (
    <div>
      <h2>Chọn loại đầu vào</h2>
      <InputTypeSelector onSelect={setInputType} />

      {inputType === 'image' || inputType === 'video' ? (
        <FileInput onFileChange={handleFileChange} />
      ) : inputType === 'webcam' ? (
        <WebcamControls onCapture={handleCapture} />
      ) : null}

      <hr />

      {inputType === 'image' && fileURL && <ImageViewer src={fileURL} />}
      {inputType === 'video' && fileURL && <VideoPlayer src={fileURL} />}
      {inputType === 'webcam' && <WebcamFeed />}
    </div>
  );
}

export default MainInputArea;
