import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Star, Newspaper } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/mediaUrl'
import { countByStatus, filterContentItems, formatDate, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ContentToolbar, MiniStat } from '@/components/content/ContentToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'

function NewsGridCard({ item, onDelete }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img src={mediaUrl(item.imageUrl)} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <Newspaper className="h-10 w-10 text-primary/40" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant={item.status} />
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{item.category}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug">{item.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{truncate(item.excerpt, 100)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{formatDate(item.publishedAt || item.updatedAt)}</span>
          <span className="font-mono">{item.slug}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link to={`/news/${item.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Delete article">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function NewsPage() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('grid')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getNews({ page, limit: 50 })
      setItems(res.data)
      setPages(res.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const base = countByStatus(items)
    base.featured = items.filter((i) => i.isFeatured).length
    return base
  }, [items])

  const filtered = useMemo(
    () => filterContentItems(items, { search, status }),
    [items, search, status],
  )

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return
    await api.deleteNews(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="News"
        description="Create, publish, and manage news articles for the public website."
        actions={
          <Link to="/news/new">
            <Button>
              <Plus className="h-4 w-4" />
              New article
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total articles" value={counts.total} accent="blue" />
        <MiniStat label="Published" value={counts.published} accent="green" />
        <MiniStat label="Drafts" value={counts.draft} accent="amber" />
        <MiniStat label="Featured" value={counts.featured} accent="purple" />
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
        placeholder="Search articles…"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching articles' : 'No articles yet'}
          description={items.length ? 'Try a different search or filter.' : 'Create your first news article to get started.'}
          icon={Newspaper}
          action={
            !items.length && (
              <Link to="/news/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create article
                </Button>
              </Link>
            )
          }
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <NewsGridCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Article</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Published</TableHeader>
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
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Newspaper className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={item.status} />
                      {item.isFeatured && <Badge variant="published">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(item.publishedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link to={`/news/${item.id}/edit`} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
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
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
