import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

function Guard({ role }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (!user) return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/auth/login'} replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/account'} replace />;
  return <Outlet />;
}

export function ProtectedRoute() { return <Guard role="CUSTOMER" />; }
export function AdminRoute() { return <Guard role="ADMIN" />; }
