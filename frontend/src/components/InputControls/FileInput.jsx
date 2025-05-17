import React from 'react';

function FileInput({ inputType, handleFileSelect }) {
  if (inputType !== 'image' && inputType !== 'video') return null;

  return (
    <div className="mb-4">
      <input
        type="file"
        accept={inputType === 'image' ? 'image/*' : 'video/*'}
        onChange={handleFileSelect}
        className="block w-full border p-2 rounded"
      />
    </div>
  );
}

export default FileInput;
