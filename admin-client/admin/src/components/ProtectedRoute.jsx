import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/Common'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ section }) {
  const { user, loading, canAccess } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner className="min-h-screen" />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (section && !canAccess(section)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner className="min-h-screen" />

  if (user) {
    const from = location.state?.from
    const destination = from && from !== '/login' ? from : '/'
    return <Navigate to={destination} replace />
  }

  return <Outlet />
}

export function FallbackRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner className="min-h-screen" />

  return <Navigate to={user ? '/' : '/login'} replace />
}
