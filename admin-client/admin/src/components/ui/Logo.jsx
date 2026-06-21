import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/branding/vmg-logo.jpg'
const LOGO_FALLBACK = '/placeholder-logo.svg'

const imgSizes = {
  sm: 'h-8',
  default: 'h-10',
  lg: 'h-12',
}

export function Logo({
  className,
  size = 'default',
  showText = true,
  subtitle = 'Admin Panel',
  layout = 'horizontal',
}) {
  const imgClass = imgSizes[size] || imgSizes.default

  if (!showText || layout === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <img
          src={LOGO_SRC}
          alt="Vision Mentors Group"
          className={cn('w-auto object-contain', imgClass)}
          onError={(e) => {
            e.currentTarget.src = LOGO_FALLBACK
          }}
        />
      </div>
    )
  }

  if (layout === 'stacked') {
    return (
      <div className={cn('flex flex-col items-center text-center', className)}>
        <div className="mb-3 flex h-14 w-full items-center justify-center rounded-xl border border-border/60 bg-white px-3 py-2 shadow-sm">
          <img
            src={LOGO_SRC}
            alt="Vision Mentors Group"
            className="max-h-10 w-auto max-w-full object-contain"
            onError={(e) => {
              e.currentTarget.src = LOGO_FALLBACK
            }}
          />
        </div>
        <p className="font-serif text-sm font-semibold leading-snug text-foreground">Vision Mentors Group</p>
        {subtitle && (
          <span className="mt-1.5 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {subtitle}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <div className="flex shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white px-2 py-1.5 shadow-sm">
        <img
          src={LOGO_SRC}
          alt="Vision Mentors Group"
          className={cn('w-auto object-contain', imgClass)}
          onError={(e) => {
            e.currentTarget.src = LOGO_FALLBACK
          }}
        />
      </div>
      {showText && (
        <div className="min-w-0">
          <p className="truncate font-serif text-sm font-semibold leading-tight text-foreground">Vision Mentors Group</p>
          {subtitle && (
            <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function SidebarBrand({ collapsed, onToggleCollapse }) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-3">
        <Logo showText={false} size="sm" layout="icon" />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative px-4 py-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/[0.06] to-transparent" />
      <div className="relative flex items-start justify-between gap-2">
        <Logo layout="stacked" subtitle="Admin Portal" className="flex-1" />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
