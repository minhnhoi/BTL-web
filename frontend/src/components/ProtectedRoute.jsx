import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken, getLocalData } from '../utils/storage';

function getFallbackPath(role) {
  return role === 'admin' ? '/dashboard' : '/attendance';
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const currentUser = getLocalData('currentUser');
  const token = getAuthToken();

  if (!currentUser || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getFallbackPath(currentUser.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
