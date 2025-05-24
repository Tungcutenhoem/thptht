import React from 'react';

function FileInput({ inputType, handleFileSelect }) {
  const id = 'file-upload';

  if (inputType !== 'image' && inputType !== 'video') return null;

  return (
    <div>
      <label
        htmlFor={id}
        className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {inputType === 'image' ? 'Chọn ảnh' : 'Chọn video'}
      </label>

      <input
        id={id}
        type="file"
        accept={inputType === 'image' ? 'image/*' : 'video/*'}
        title={inputType === 'image' ? 'Chọn file ảnh để tải lên' : 'Chọn file video để tải lên'}
        onChange={handleFileSelect}
        className="hidden"  {/* Ẩn input, chỉ hiện label làm nút */}
      />
    </div>
  );
}

export default FileInput;
