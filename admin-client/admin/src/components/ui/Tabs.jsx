import { cn } from '@/lib/utils'

export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            active === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
