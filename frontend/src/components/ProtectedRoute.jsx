import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from './NotificationToast';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const toast = useToast();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location, message: 'Please login first to access this page' }} replace />;
  }

  // If role is specified, check if user has that role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
