import React from 'react';
import ReactDOM from 'react-dom/client'; // Sử dụng `react-dom/client` nếu bạn đang sử dụng React 18+
import './App.css'; // Import file CSS chính của bạn
import App from './App'; // Import component App chính của bạn

// Khởi tạo ứng dụng và render vào div với id là "root"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
