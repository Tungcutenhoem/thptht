import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Profile', path: '/profile', icon: '👤' },
    ...(user?.role === 'admin' ? [
      { label: 'Admin', path: '/admin', icon: '⚙️' },
    ] : []),
  ];

  return (
    <div className="bg-blue-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Food Freshness</h2>
      </div>

      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className="flex items-center space-x-2 p-2 rounded hover:bg-blue-800"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-2 p-2 rounded bg-red-600 hover:bg-red-700"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>

  );
}

export default Sidebar; 