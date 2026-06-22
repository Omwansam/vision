import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, FileText, MapPin, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { countByStatus, deadlineLabel, filterContentItems, formatDate, paginateClient, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ContentToolbar, MiniStat } from '@/components/content/ContentToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'

const TENDER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
  { id: 'awarded', label: 'Awarded' },
  { id: 'cancelled', label: 'Cancelled' },
]

function TenderGridCard({ item, onDelete }) {
  const deadline = deadlineLabel(item.deadline)
  const isUrgent = item.status === 'open' && (deadline.includes('today') || deadline === 'Due tomorrow')

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-semibold text-primary">{item.referenceId}</p>
            <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{item.title}</h3>
          </div>
          <Badge variant={item.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{truncate(item.description, 120)}</p>
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Deadline: {formatDate(item.deadline)}</span>
            {item.status === 'open' && (
              <span className={`ml-auto rounded-full px-2 py-0.5 font-medium ${isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground'}`}>
                {deadline}
              </span>
            )}
          </div>
          {item.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 capitalize">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span>{item.category}</span>
            {item.budgetLabel && <span className="ml-auto font-medium text-foreground">{item.budgetLabel}</span>}
          </div>
        </div>
        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Link to={`/tenders/${item.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Delete tender">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function TendersPage() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('grid')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getTenders({ limit: 100 })
      setItems(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [search, status])

  const counts = useMemo(() => countByStatus(items), [items])

  const filtered = useMemo(
    () => filterContentItems(items, { search, status }),
    [items, search, status],
  )

  const paged = useMemo(() => paginateClient(filtered, page, 12), [filtered, page])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tender?')) return
    await api.deleteTender(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Tenders"
        description="Manage procurement tenders, deadlines, and publication status."
        actions={
          <Link to="/tenders/new">
            <Button>
              <Plus className="h-4 w-4" />
              New tender
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total tenders" value={counts.total} accent="blue" />
        <MiniStat label="Open" value={counts.open} accent="green" />
        <MiniStat label="Awarded" value={counts.awarded} accent="purple" />
        <MiniStat label="Closed / cancelled" value={(counts.closed || 0) + (counts.cancelled || 0)} accent="amber" />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      <ContentToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        view={view}
        onViewChange={setView}
        counts={counts}
        tabs={TENDER_TABS}
        placeholder="Search tenders…"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching tenders' : 'No tenders yet'}
          description={items.length ? 'Try a different search or filter.' : 'Create your first procurement tender.'}
          icon={FileText}
          action={
            !items.length && (
              <Link to="/tenders/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create tender
                </Button>
              </Link>
            )
          }
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paged.data.map((item) => (
              <TenderGridCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Reference</TableHeader>
                <TableHeader>Tender</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Deadline</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {paged.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">{item.referenceId}</TableCell>
                  <TableCell>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{item.category}{item.location ? ` · ${item.location}` : ''}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status} />
                  </TableCell>
                  <TableCell>
                    <p>{formatDate(item.deadline)}</p>
                    {item.status === 'open' && (
                      <p className="text-xs text-muted-foreground">{deadlineLabel(item.deadline)}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/tenders/${item.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
