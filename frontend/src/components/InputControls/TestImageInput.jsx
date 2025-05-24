import React from 'react';

export default function TestImageInput() {
  const handleChange = (e) => {
    console.log('Selected files:', e.target.files);
    // reset value để chắc chắn onChange sẽ được gọi lại nếu chọn file cũ
    e.target.value = null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Input Image File</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
  );
}
