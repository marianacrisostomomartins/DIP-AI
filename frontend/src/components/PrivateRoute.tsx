import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api';

interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  if (!apiClient.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
