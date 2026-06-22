import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImageIcon, Upload, X } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/mediaUrl'
import { Alert, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'

const CATEGORIES = [
  'Early Childhood Development',
  'Maternal Health',
  'Community Resilience',
  'Events',
  'General',
]

const emptyForm = {
  title: '',
  category: 'General',
  url: '',
  altText: '',
  status: 'published',
}

function GalleryPreview({ form, previewSrc }) {
  const src = previewSrc || (form.url ? mediaUrl(form.url) : '')

  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <div className="aspect-[4/3] bg-muted">
        {src ? (
          <img src={src} alt={form.altText || form.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-40" />
            <p className="text-sm">Upload a photo to preview</p>
          </div>
        )}
      </div>
      <CardContent className="space-y-2 pt-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={form.status} />
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {form.category || 'Category'}
          </span>
        </div>
        <p className="font-semibold">{form.title || 'Image title'}</p>
        <p className="text-xs text-muted-foreground">{form.altText || 'Alt text for accessibility…'}</p>
      </CardContent>
    </Card>
  )
}

export default function GalleryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setError('')
  }

  const clearSelectedFile = () => {
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!imageFile && !form.url) {
      setError('Please upload a photo or provide an image URL.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('title', form.title)
        formData.append('category', form.category)
        formData.append('altText', form.altText || '')
        formData.append('status', form.status)

        if (isEdit) await api.updateGalleryItem(id, formData)
        else await api.createGalleryItem(formData)
      } else {
        const payload = {
          title: form.title,
          category: form.category,
          url: form.url,
          altText: form.altText,
          status: form.status,
        }
        if (isEdit) await api.updateGalleryItem(id, payload)
        else await api.createGalleryItem(payload)
      }

      toast({ message: isEdit ? 'Gallery image updated.' : 'Gallery image added.' })
      navigate('/gallery')
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
        title={isEdit ? 'Edit gallery image' : 'Add gallery image'}
        description="Upload photos taken in the field. Images are stored on the server — no external URL required."
        actions={
          <Link to="/gallery">
            <Button variant="outline">Cancel</Button>
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Image details" description="Title and category shown in the gallery grid.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={form.title} onChange={update('title')} placeholder="Photo title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select id="category" value={form.category} onChange={update('category')}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
              </div>
            </div>
          </FormSection>

          <FormSection title="Photo upload" description="JPEG, PNG, GIF, or WebP up to 10 MB.">
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-6">
              {imageFile ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <img src={localPreview} alt="Selected upload" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{imageFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(imageFile.size / 1024 / 1024).toFixed(2)} MB — ready to upload on save
                    </p>
                    <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={clearSelectedFile}>
                      <X className="h-4 w-4" />
                      Remove selection
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 py-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to upload a photo</p>
                    <p className="mt-1 text-xs text-muted-foreground">or drag and drop from your device</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              )}

              {!imageFile && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Or use an external URL
                  </p>
                  <Input
                    id="url"
                    value={form.url}
                    onChange={update('url')}
                    placeholder="https://… (optional fallback)"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="altText">Alt text</Label>
              <Textarea
                id="altText"
                rows={2}
                value={form.altText}
                onChange={update('altText')}
                placeholder="Describe the image for screen readers and SEO"
              />
            </div>
          </FormSection>

          <FormSection title="Publishing">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={form.status} onChange={update('status')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
          </FormSection>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Upload & add image'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/gallery')}>
              Cancel
            </Button>
          </div>
        </form>

        <aside className="hidden xl:block">
          <div className="sticky top-20 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
            <GalleryPreview form={form} previewSrc={localPreview} />
          </div>
        </aside>
      </div>
    </div>
  )
}
