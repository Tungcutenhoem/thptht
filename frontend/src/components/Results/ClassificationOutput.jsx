import React, { useEffect } from 'react';

function ClassificationOutput({ result }) {
    console.log('🟢 ClassificationOutput received props:', result);
  useEffect(() => {
  }, [result]);

  if (!result) {
    console.log('🟡 No result provided yet.');
    return null;
  }

  const {classification, confidence, bounding_box} = result.data

  return (
    <div>
      <p><strong>Status:</strong> Success</p>
      <p><strong>Classification:</strong> {classification}</p>
      <p><strong>Confidence:</strong> {confidence?.toFixed(2)}%</p>
        <p><strong>Bounding box:</strong> {bounding_box[0]}, {bounding_box[1]}, {bounding_box[2]}, {bounding_box[3]}</p>
    </div>
  );
}

export default ClassificationOutput;
