import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // If not logged in, or if logged in but not an admin, redirect to admin login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location, message: 'Admin access required. Please sign in.' }} replace />;
  }

  return children;
}
