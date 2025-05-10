import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Food Freshness Detection</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.username}</span>
              {user.role === 'admin' && (
                <a
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </a>
              )}
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 