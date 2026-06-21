import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function Table({ className, ...props }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className={cn('w-full text-sm', className)} {...props} />
    </div>
  )
}

export function TableHead({ className, ...props }) {
  return <thead className={cn('border-b border-border bg-muted/40', className)} {...props} />
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />
}

export function TableRow({ className, ...props }) {
  return <tr className={cn('transition-colors hover:bg-muted/30', className)} {...props} />
}

export function TableHeader({ className, ...props }) {
  return (
    <th
      className={cn('px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground', className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }) {
  return <td className={cn('px-4 py-3.5 text-foreground', className)} {...props} />
}

export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
