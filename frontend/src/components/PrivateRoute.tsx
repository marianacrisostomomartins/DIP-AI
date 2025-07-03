import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.email) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
