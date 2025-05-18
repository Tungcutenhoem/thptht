import api from './api';

class ClassificationService {
  async classifyImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    try {
      const response = await api.post('/classify/analyze_image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout for image upload
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Image upload timed out. Please try again.');
      }
      console.error('Error classifying image:', error);
      throw error;
    }
  }

  async classifyFrame(frameData) {
    try {
      const response = await api.post('/classify/frame', {
        frame: frameData,
      }, {
        timeout: 5000, // 5 second timeout for frame processing
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Frame processing timed out. Please try again.');
      }
      console.error('Error classifying frame:', error);
      throw error;
    }
  }
}

export default new ClassificationService(); 