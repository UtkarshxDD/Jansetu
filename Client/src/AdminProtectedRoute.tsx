import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/**
 * Protects admin routes by checking for adminToken in localStorage.
 * If not present, redirects to /admin/login.
 */
const AdminProtectedRoute: React.FC = () => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    toast.error('Admin access required. Please log in.');
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
