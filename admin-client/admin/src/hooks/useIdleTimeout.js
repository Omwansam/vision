import { useEffect, useRef } from 'react'

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

export function useIdleTimeout({ onIdle, timeoutMs, enabled = true }) {
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  useEffect(() => {
    if (!enabled || timeoutMs <= 0) return undefined

    let timerId

    const reset = () => {
      window.clearTimeout(timerId)
      timerId = window.setTimeout(() => onIdleRef.current(), timeoutMs)
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, reset, { passive: true }))
    reset()

    return () => {
      window.clearTimeout(timerId)
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, reset))
    }
  }, [timeoutMs, enabled])
}

export const IDLE_LOGOUT_KEY = 'vmg_idle_logout'

export function getIdleTimeoutMs() {
  const minutes = parseInt(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES, 10)
  const resolved = Number.isFinite(minutes) && minutes > 0 ? minutes : 30
  return resolved * 60 * 1000
}
