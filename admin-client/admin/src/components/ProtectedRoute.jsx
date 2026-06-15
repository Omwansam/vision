import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/Common'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ section }) {
  const { user, loading, canAccess } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner className="min-h-screen" />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (section && !canAccess(section)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
