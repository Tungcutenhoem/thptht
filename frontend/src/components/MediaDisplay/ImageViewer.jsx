import React from 'react';

function ImageViewer({ src }) {
  return (
    <div>
      <img src={src} alt="Ảnh đầu vào" style={{ maxWidth: '100%' }} />
    </div>
  );
}

export default ImageViewer;
