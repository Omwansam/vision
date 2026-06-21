import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const LABELS = {
  news: 'News',
  programs: 'Programs',
  gallery: 'Gallery',
  impact: 'Impact',
  tenders: 'Tenders',
  donations: 'Donations',
  submissions: 'Submissions',
  contact: 'Contact',
  volunteers: 'Volunteers',
  partnerships: 'Partnerships',
  newsletter: 'Newsletter',
  users: 'Users',
  settings: 'Settings',
  notifications: 'Notifications',
  new: 'New',
  edit: 'Edit',
}

export function Breadcrumbs({ className }) {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <nav className={cn('flex items-center gap-1 text-sm', className)}>
        <span className="font-medium text-foreground">Dashboard</span>
      </nav>
    )
  }

  const crumbs = segments.map((seg, i) => {
    const path = `/${segments.slice(0, i + 1).join('/')}`
    const isLast = i === segments.length - 1
    const label = LABELS[seg] || (seg.length > 20 ? 'Details' : seg)
    return { path, label, isLast }
  })

  return (
    <nav className={cn('flex items-center gap-1 text-sm', className)} aria-label="Breadcrumb">
      <Link to="/" className="text-muted-foreground hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="text-muted-foreground hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
