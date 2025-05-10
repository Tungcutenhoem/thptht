import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <div>You do not have permission to access this page.</div>;
  }

  return children;
}

export default ProtectedRoute; 