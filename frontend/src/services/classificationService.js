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
        timeout: 10000, // 10 seconds
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Image analysis timed out. Please try again.');
      }
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  async classifyCamera(formData) {
    try {
      const response = await api.post('/classify/frame', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 seconds
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Camera analysis timed out. Please try again.');
      }
      console.error('Error analyzing camera input:', error);
      throw error;
    }
  }

  async classifyVideo(videoFile) {
    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      const response = await api.post('/classify/analyze_video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Video analysis timed out. Please try again.');
      }
      console.error('Error analyzing video:', error);
      throw error;
    }
  }
}

export default new ClassificationService();
