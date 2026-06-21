import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function LoadingSpinner({ className }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      )}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-in', className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Alert({ variant = 'error', children, className }) {
  const styles = {
    error: 'border-destructive/30 bg-destructive/8 text-destructive',
    success: 'border-success/30 bg-success/8 text-success',
    info: 'border-primary/30 bg-primary/8 text-primary',
    warning: 'border-warning/40 bg-warning/10 text-amber-800',
  }

  return (
    <div className={cn('rounded-lg border px-4 py-3 text-sm', styles[variant], className)}>{children}</div>
  )
}

const statColors = {
  blue: 'from-blue-500/15 to-blue-600/5 text-blue-600',
  green: 'from-emerald-500/15 to-emerald-600/5 text-emerald-600',
  purple: 'from-purple-500/15 to-purple-600/5 text-purple-600',
  orange: 'from-orange-500/15 to-orange-600/5 text-orange-600',
  pink: 'from-pink-500/15 to-pink-600/5 text-pink-600',
}

export function StatCard({ title, value, subtitle, icon: Icon, to, color = 'blue', trend }) {
  const content = (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value ?? '—'}</p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={cn('mt-2 text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-muted-foreground')}>
                {trend.label}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                statColors[color],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return to ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}

export function QuickAction({ to, icon: Icon, label, description }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </Link>
  )
}

export function FormSection({ title, description, children, className }) {
  return (
    <Card className={cn('animate-fade-in', className)}>
      {(title || description) && (
        <CardHeader className="border-b border-border/60 pb-4">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(title || description ? 'pt-5' : 'pt-6')}>{children}</CardContent>
    </Card>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}

export function Avatar({ name, className, size = 'default' }) {
  const initials = (name || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizes = {
    sm: 'h-7 w-7 text-xs',
    default: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-semibold text-primary-foreground',
        sizes[size],
        className,
      )}
      title={name}
    >
      {initials}
    </div>
  )
}

export function WelcomeBanner({ name, role }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-6 text-primary-foreground shadow-lg sm:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-sm font-medium text-primary-foreground/80">{greeting}</p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{name?.split(' ')[0] || 'Admin'}</h2>
        <p className="mt-2 max-w-lg text-sm text-primary-foreground/85">
          Manage content, review submissions, and keep Vision Mentors Group running smoothly.
        </p>
        {role && (
          <span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium capitalize backdrop-blur-sm">
            {role}
          </span>
        )}
      </div>
    </div>
  )
}
