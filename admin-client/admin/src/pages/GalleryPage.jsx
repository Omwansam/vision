import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return
    await api.deleteGalleryItem(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Manage gallery images and categories."
        actions={
          <Link
            to="/gallery/new"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add image
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState title="No gallery images" description="Add images to populate the gallery." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
              <div className="relative overflow-hidden">
                <img src={item.url} alt={item.altText || item.title} className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute right-2 top-2">
                  <Badge variant={item.status} />
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <div className="mt-3 flex gap-1 border-t border-border pt-3">
                  <Link to={`/gallery/${item.id}/edit`} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm hover:bg-muted">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
