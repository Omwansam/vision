import { useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getIdleTimeoutMs, IDLE_LOGOUT_KEY, useIdleTimeout } from '@/hooks/useIdleTimeout'

export function IdleTimeoutGuard() {
  const { user, logout } = useAuth()

  const handleIdle = useCallback(async () => {
    sessionStorage.setItem(IDLE_LOGOUT_KEY, '1')
    await logout()
  }, [logout])

  useIdleTimeout({
    onIdle: handleIdle,
    timeoutMs: getIdleTimeoutMs(),
    enabled: Boolean(user),
  })

  return null
}
