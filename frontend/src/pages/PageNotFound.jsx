import React from 'react';

const NotFoundPage = () => {
  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-[#0b1f3a] px-4">
    <h1 className="text-6xl text-gray mb-2">404</h1>
    <p className="text-2xl mb-6">Trang bạn tìm không tồn tại.</p>
    <button
      onClick={() => window.location.href = '/'}
      className="bg-[#3dd9e6] hover:bg-[#0b1f3a] text-white font-semibold px-6 py-2 rounded transition"
    >
      Quay về Trang chủ
    </button>
  </div>
);
};

export default NotFoundPage;
