import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../userAuth/AuthContex';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner

  if (!user) {
     return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
