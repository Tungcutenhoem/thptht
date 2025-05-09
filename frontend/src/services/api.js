import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for handling errors
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const classifyImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await api.post('/classify/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

export const classifyFrame = async (frameData) => {
  const response = await api.post('/classify/frame', {
    frame: frameData
  });
  
  return response.data.data;
};

export const classifyVideo = async (videoFile) => {
  const formData = new FormData();
  formData.append('file', videoFile);
  
  const response = await api.post('/classify/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data;
};

export default api; 