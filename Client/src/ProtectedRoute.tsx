import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!token && !hasShownToast.current) {
      toast.error("You need to log in first.");
      hasShownToast.current = true;
    }
  }, [token, location]);

  return token ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;