import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ImageIcon, FolderOpen } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/mediaUrl'
import { countByCategory, countByStatus, filterContentItems } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ContentToolbar, MiniStat } from '@/components/content/ContentToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

function GalleryGridCard({ item, onDelete }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={mediaUrl(item.url)}
          alt={item.altText || item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant={item.status} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <p className="truncate text-sm font-medium text-white drop-shadow">{item.title}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold leading-snug">{item.title}</p>
        <p className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          <FolderOpen className="h-3 w-3" />
          {item.category}
        </p>
        {item.altText && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.altText}</p>
        )}
        <div className="mt-4 flex gap-2 border-t border-border pt-3">
          <Link to={`/gallery/${item.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Delete image">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function GalleryPage() {
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
      const res = await api.getGallery()
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
  const categories = useMemo(() => countByCategory(items), [items])
  const categoryCount = Object.keys(categories).filter((k) => k !== 'total').length

  const filtered = useMemo(
    () => filterContentItems(items, { search, status }),
    [items, search, status],
  )

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return
    await api.deleteGalleryItem(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Manage photos and media displayed on the public gallery page."
        actions={
          <Link to="/gallery/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add image
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total images" value={counts.total} accent="blue" />
        <MiniStat label="Published" value={counts.published} accent="green" />
        <MiniStat label="Drafts" value={counts.draft} accent="amber" />
        <MiniStat label="Categories" value={categoryCount} accent="purple" />
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
        placeholder="Search gallery…"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching images' : 'No gallery images'}
          description={items.length ? 'Try a different search or filter.' : 'Add images to populate the public gallery.'}
          icon={ImageIcon}
          action={
            !items.length && (
              <Link to="/gallery/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Add image
                </Button>
              </Link>
            )
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <GalleryGridCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Image</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Alt text</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.url}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Badge variant={item.status} />
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">{item.altText || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link to={`/gallery/${item.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
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
