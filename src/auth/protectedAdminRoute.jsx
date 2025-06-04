// src/auth/ProtectedAdminRoute.jsx
import React from 'react';
import { useAuth } from './authContext';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role === 'user') {
    return <Navigate to="/404" />;
  }

  return children;
};

export default ProtectedAdminRoute;
