import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Alert, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'

const emptyForm = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  category: 'Programs',
  imageUrl: '',
  status: 'draft',
  isFeatured: false,
}

export default function NewsFormPage() {
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
        const res = await api.getNews({ limit: 100 })
        const article = res.data.find((a) => a.id === id)
        if (!article) throw new Error('Article not found')
        setForm({
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt || '',
          body: article.body || '',
          category: article.category,
          imageUrl: article.imageUrl || '',
          status: article.status,
          isFeatured: article.isFeatured,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, isEdit])

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (isEdit) {
        await api.updateNews(id, form)
      } else {
        await api.createNews(form)
      }
      navigate('/news')
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
        title={isEdit ? 'Edit article' : 'New article'}
        actions={
          <Link
            to="/news"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
          >
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
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" required value={form.slug} onChange={update('slug')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" required value={form.excerpt} onChange={update('excerpt')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea id="body" rows={8} value={form.body} onChange={update('body')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" required value={form.category} onChange={update('category')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={form.status} onChange={update('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={form.imageUrl} onChange={update('imageUrl')} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={update('isFeatured')} />
          Featured article
        </label>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create article'}
        </Button>
      </form>
    </div>
  )
}
