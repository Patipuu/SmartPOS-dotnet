import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ allowedRoles = [], children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

