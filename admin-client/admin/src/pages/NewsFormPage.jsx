import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/mediaUrl'
import { slugify } from '@/lib/utils'
import { Alert, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ImageUploadField } from '@/components/ui/ImageUploadField'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'

const CATEGORIES = ['Programs', 'Health', 'Transparency', 'Events', 'Announcements', 'Partnerships']

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

function ArticlePreview({ form, previewSrc }) {
  const src = previewSrc || (form.imageUrl ? mediaUrl(form.imageUrl) : '')

  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <div className="aspect-[16/9] bg-muted">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image set</div>
        )}
      </div>
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant={form.status} />
          {form.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </span>
          )}
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {form.category || 'Category'}
          </span>
        </div>
        <CardTitle className="text-xl leading-snug">{form.title || 'Article title preview'}</CardTitle>
        <p className="text-sm text-muted-foreground">{form.excerpt || 'Excerpt will appear here…'}</p>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {form.body || 'Article body content will appear here…'}
        </p>
        {form.slug && (
          <p className="mt-4 font-mono text-xs text-muted-foreground">/news/{form.slug}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function NewsFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const localPreview = useMemo(() => {
    if (!imageFile) return null
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

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
        setSlugTouched(true)
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
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !slugTouched) next.slug = slugify(value)
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('slug', form.slug)
        formData.append('title', form.title)
        formData.append('excerpt', form.excerpt)
        formData.append('body', form.body || '')
        formData.append('category', form.category)
        formData.append('status', form.status)
        formData.append('isFeatured', String(form.isFeatured))

        if (isEdit) await api.updateNews(id, formData)
        else await api.createNews(formData)
      } else {
        if (isEdit) await api.updateNews(id, form)
        else await api.createNews(form)
      }

      toast({ message: isEdit ? 'Article updated.' : 'Article created.' })
      navigate('/news')
    } catch (err) {
      setError(err.message)
      toast({ message: err.message, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit article' : 'New article'}
        description={isEdit ? 'Update this news article.' : 'Create a new news article or announcement.'}
        actions={
          <Link to="/news">
            <Button variant="outline">Cancel</Button>
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Basic information" description="Title, slug, and summary shown in listings.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={form.title} onChange={update('title')} placeholder="Article headline" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }}
                  placeholder="article-url-slug"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="excerpt">Excerpt</Label>
                <span className="text-xs text-muted-foreground">{form.excerpt.length} chars</span>
              </div>
              <Textarea id="excerpt" required rows={3} value={form.excerpt} onChange={update('excerpt')} placeholder="Short summary for listings and social sharing" />
            </div>
          </FormSection>

          <FormSection title="Content" description="Full article body text.">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">Body</Label>
                <span className="text-xs text-muted-foreground">{form.body.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <Textarea id="body" rows={12} value={form.body} onChange={update('body')} placeholder="Write the full article content…" />
            </div>
          </FormSection>

          <FormSection title="Publishing" description="Category, status, image, and featured settings.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select id="category" value={form.category} onChange={update('category')}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={update('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <ImageUploadField
                  label="Cover image"
                  file={imageFile}
                  previewSrc={localPreview}
                  onFileChange={setImageFile}
                  onClearFile={() => setImageFile(null)}
                  existingUrl={form.imageUrl}
                  onExistingUrlChange={(value) => setForm((prev) => ({ ...prev, imageUrl: value }))}
                />
              </div>
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={form.isFeatured}
                onChange={update('isFeatured')}
              />
              <div>
                <p className="text-sm font-medium">Featured article</p>
                <p className="text-xs text-muted-foreground">Highlight on the homepage and news listings</p>
              </div>
            </label>
          </FormSection>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create article'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/news')}>
              Cancel
            </Button>
          </div>
        </form>

        <aside className="hidden xl:block">
          <div className="sticky top-20 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
            <ArticlePreview form={form} previewSrc={localPreview} />
          </div>
        </aside>
      </div>
    </div>
  )
}
