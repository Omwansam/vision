import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function TopBar({ onMenuClick, title }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      {title && <h1 className="text-sm font-medium text-muted-foreground lg:hidden">{title}</h1>}
    </header>
  )
}
