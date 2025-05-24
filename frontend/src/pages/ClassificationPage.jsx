import React, { useState } from 'react';
import FileInput from '../components/InputControls/FileInput';
import ImageViewer from '../components/MediaDisplay/ImageViewer';
import ClassificationService from '../services/classificationService';
import ClassificationOutput from '../components/Results/ClassificationOutput';

function ClassificationPage() {
  console.log('🟢 ClassificationPage rendered');
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileSelect = async (event) => {
    console.log("handleFileSelect");
    const file = event.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setResult(null); // Reset kết quả cũ khi chọn ảnh mới

    try {
      console.log('Sending image to backend...');
      const prediction = await ClassificationService.classifyImage(file);
      console.log('🔍 Full response from backend:', prediction);
      console.log('Parsed result:', prediction.data);

      // prediction có dạng { classification, confidence, bounding_box }
      setResult(prediction.data);
    } catch (error) {
      console.error('Phân loại lỗi:', error);
      alert('Không thể phân loại ảnh: ' + error.message);
    }
  };

  return (
    <div>
      <FileInput inputType="image" handleFileSelect={handleFileSelect} />
      {imagePreview && <ImageViewer imageUrl={imagePreview} />}
      {/* Hiển thị kết quả phân loại */}
      <ClassificationOutput result={result} />

      {/* Nút test console */}
      <button onClick={() => console.log('Button clicked!')}>Test Button</button>
    </div>
  );
}

export default ClassificationPage;
