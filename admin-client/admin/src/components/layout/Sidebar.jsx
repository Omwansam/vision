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
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { SidebarBrand } from '@/components/ui/Logo'

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
      { to: '/notifications', label: 'Email & Alerts', icon: Mail, section: 'notifications' },
      { to: '/users', label: 'Users', icon: Users, section: 'users' },
      { to: '/settings', label: 'Site Settings', icon: Settings, section: 'settings' },
    ],
  },
]

export function Sidebar({ collapsed = false, onToggleCollapse, onNavigate }) {
  const { canAccess } = useAuth()

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
    <aside
      className={cn(
        'flex h-svh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="shrink-0 border-b border-sidebar-border">
        <SidebarBrand collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mx-2 mb-2 border-b border-sidebar-border/60" />}
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={onNavigate}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center rounded-lg text-sm font-medium transition-all',
                        collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80 group-[.active]:opacity-100" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
