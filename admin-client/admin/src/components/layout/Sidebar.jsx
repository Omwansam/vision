import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Newspaper,
  Layers,
  Image,
  TrendingUp,
  FileText,
  Heart,
  Inbox,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'dashboard' }],
  },
  {
    label: 'Content',
    section: 'content',
    items: [
      { to: '/news', label: 'News', icon: Newspaper },
      { to: '/programs', label: 'Programs', icon: Layers },
      { to: '/gallery', label: 'Gallery', icon: Image },
      { to: '/impact', label: 'Impact', icon: TrendingUp },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/tenders', label: 'Tenders', icon: FileText, section: 'tenders' },
      { to: '/donations', label: 'Donations', icon: Heart, section: 'donations' },
    ],
  },
  {
    label: 'Submissions',
    section: 'submissions',
    items: [
      { to: '/submissions/contact', label: 'Contact', icon: Inbox },
      { to: '/submissions/volunteers', label: 'Volunteers', icon: Users },
      { to: '/submissions/partnerships', label: 'Partnerships', icon: Users },
      { to: '/submissions/newsletter', label: 'Newsletter', icon: Inbox },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users', label: 'Users', icon: Users, section: 'users' },
      { to: '/settings', label: 'Site Settings', icon: Settings, section: 'settings' },
    ],
  },
]

export function Sidebar({ onNavigate }) {
  const { user, logout, canAccess } = useAuth()

  const visibleGroups = navGroups
    .map((group) => {
      if (group.section && !canAccess(group.section)) return null

      const items = group.items.filter((item) => {
        const section = item.section || group.section || 'dashboard'
        return canAccess(section)
      })

      if (!items.length) return null
      return { ...group, items }
    })
    .filter(Boolean)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vision Mentors</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Admin Panel</h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 px-1">
          <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
          <p className="truncate text-xs capitalize text-muted-foreground">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
