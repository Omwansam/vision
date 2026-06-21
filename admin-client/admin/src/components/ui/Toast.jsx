import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

const variantStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-destructive/30 bg-destructive/8 text-destructive',
  info: 'border-primary/30 bg-primary/8 text-primary',
}

const variantIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: AlertCircle,
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const Icon = variantIcons[toast.variant] || CheckCircle2

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 200)
    }, toast.duration)

    return () => {
      cancelAnimationFrame(enter)
      clearTimeout(timer)
    }
  }, [toast, onDismiss])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-xs items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs shadow-lg transition-all duration-200 sm:max-w-sm',
        variantStyles[toast.variant],
        visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
      )}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => {
          setVisible(false)
          setTimeout(() => onDismiss(toast.id), 200)
        }}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(({ message, variant = 'success', duration = 4000 }) => {
    const id = ++idRef.current
    setToasts((current) => [...current, { id, message, variant, duration }])
    return id
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] flex-col items-end gap-2 sm:w-auto"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
