import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { IdleTimeoutGuard } from '@/components/IdleTimeoutGuard'
import { cn } from '@/lib/utils'

const SIDEBAR_COLLAPSED_KEY = 'vmg_admin_sidebar_collapsed'

function readCollapsedPreference() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsedPreference)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // ignore storage errors
    }
  }, [collapsed])

  const toggleCollapse = () => setCollapsed((prev) => !prev)

  return (
    <div className="admin-bg min-h-svh">
      <IdleTimeoutGuard />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-20 hidden lg:block',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 h-svh w-64 shadow-2xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex min-h-svh min-w-0 flex-1 flex-col transition-[padding] duration-200',
          collapsed ? 'lg:pl-16' : 'lg:pl-64',
        )}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
