// src/auth/ProtectedSuperAdminRoute.jsx
import React from 'react';
import { useAuth } from './authContext';
import { Navigate } from 'react-router-dom';

const ProtectedSuperAdminRoute = ({ children }) => {
  const { user } = useAuth();

  // Redirect if not logged in or not super_admin
  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/404" />;
  }

  return children;
};

export default ProtectedSuperAdminRoute;
