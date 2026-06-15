import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Alert, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'

const emptyForm = {
  title: '',
  category: '',
  url: '',
  altText: '',
  status: 'published',
}

export default function GalleryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return

    async function load() {
      try {
        const res = await api.getGallery()
        const item = res.data.find((g) => g.id === id)
        if (!item) throw new Error('Image not found')
        setForm({
          title: item.title,
          category: item.category,
          url: item.url,
          altText: item.altText || '',
          status: item.status,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, isEdit])

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (isEdit) await api.updateGalleryItem(id, form)
      else await api.createGalleryItem(form)
      navigate('/gallery')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit gallery image' : 'Add gallery image'}
        actions={
          <Link to="/gallery" className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm hover:bg-muted">
            Cancel
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={form.title} onChange={update('title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" required value={form.category} onChange={update('category')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Image URL</Label>
          <Input id="url" required value={form.url} onChange={update('url')} />
        </div>

        {form.url && (
          <img src={form.url} alt={form.altText || form.title} className="h-40 rounded-md object-cover" />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="altText">Alt text</Label>
            <Input id="altText" value={form.altText} onChange={update('altText')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={form.status} onChange={update('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add image'}
        </Button>
      </form>
    </div>
  )
}
