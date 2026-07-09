import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <div className="app-loading__spinner" aria-hidden="true" />
        <p>Loading NexusHR…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
