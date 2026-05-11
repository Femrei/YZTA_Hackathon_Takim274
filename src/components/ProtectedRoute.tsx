import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, isAuthenticated, loading } = useAuth();

  
  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    
    const redirectMap: Record<UserRole, string> = {
      admin: '/admin',
      employee: '/calisan',
      customer: '/musteri',
      superadmin: '/super-admin'
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }

  return <>{children}</>;
}