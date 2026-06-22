import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Layers, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/mediaUrl'
import { countByStatus, filterContentItems, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ContentToolbar, MiniStat } from '@/components/content/ContentToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

function ProgramGridCard({ item, onDelete }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img src={mediaUrl(item.imageUrl)} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-500/10 to-primary/10">
            <Layers className="h-10 w-10 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge variant={item.status} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white drop-shadow">{item.title}</h3>
          <p className="font-mono text-xs text-white/80">/{item.slug}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          {item.iconName || 'BookOpen'}
        </div>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{truncate(item.description, 140)}</p>
        <div className="mt-4 flex gap-2 border-t border-border pt-3">
          <Link to={`/programs/${item.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-3.5 w-3.5" />
              Edit program
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Delete program">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function ProgramsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('grid')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getPrograms()
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

  const counts = useMemo(() => countByStatus(items), [items])

  const filtered = useMemo(
    () => filterContentItems(items, { search, status }),
    [items, search, status],
  )

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program?')) return
    await api.deleteProgram(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Programs"
        description="Manage program pages shown on the public website."
        actions={
          <Link to="/programs/new">
            <Button>
              <Plus className="h-4 w-4" />
              New program
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Total programs" value={counts.total} accent="blue" />
        <MiniStat label="Published" value={counts.published} accent="green" />
        <MiniStat label="Drafts" value={counts.draft} accent="amber" />
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
        placeholder="Search programs…"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching programs' : 'No programs yet'}
          description={items.length ? 'Try a different search or filter.' : 'Create a program page to showcase your work.'}
          icon={Layers}
          action={
            !items.length && (
              <Link to="/programs/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create program
                </Button>
              </Link>
            )
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <ProgramGridCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Program</TableHeader>
              <TableHeader>Slug</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <img src={mediaUrl(item.imageUrl)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{truncate(item.description, 60)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{item.slug}</TableCell>
                <TableCell>
                  <Badge variant={item.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link to={`/programs/${item.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
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
      )}
    </div>
  )
}
