import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Heart, Layers, Shield, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { mediaUrl } from '@/lib/mediaUrl'
import { slugify } from '@/lib/utils'
import { Alert, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ImageUploadField } from '@/components/ui/ImageUploadField'
import { ProgramImagesEditor } from '@/components/content/ProgramImagesEditor'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'

const ICON_OPTIONS = [
  { value: 'BookOpen', label: 'Education', icon: BookOpen },
  { value: 'Heart', label: 'Health', icon: Heart },
  { value: 'Users', label: 'Community', icon: Users },
  { value: 'Shield', label: 'Resilience', icon: Shield },
  { value: 'Layers', label: 'Programs', icon: Layers },
]

const emptyForm = {
  slug: '',
  title: '',
  description: '',
  imageUrl: '',
  iconName: 'BookOpen',
  status: 'draft',
}

function ProgramPreview({ form, previewSrc }) {
  const Icon = ICON_OPTIONS.find((o) => o.value === form.iconName)?.icon || BookOpen
  const src = previewSrc || (form.imageUrl ? mediaUrl(form.imageUrl) : '')

  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <div className="relative aspect-[16/10] bg-muted">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image set</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-white/15 px-2 py-1 backdrop-blur-sm">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium">{form.iconName}</span>
          </div>
          <h3 className="text-xl font-bold">{form.title || 'Program title'}</h3>
        </div>
      </div>
      <CardContent className="space-y-3 pt-4">
        <Badge variant={form.status} />
        <p className="text-sm leading-relaxed text-muted-foreground">
          {form.description || 'Program description preview…'}
        </p>
        {form.slug && <p className="font-mono text-xs text-muted-foreground">/programs/{form.slug}</p>}
      </CardContent>
    </Card>
  )
}

export default function ProgramFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [carouselImages, setCarouselImages] = useState([])
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
        const res = await api.getPrograms()
        const program = res.data.find((p) => p.id === id)
        if (!program) throw new Error('Program not found')
        setForm({
          slug: program.slug,
          title: program.title,
          description: program.description || '',
          imageUrl: program.imageUrl || '',
          iconName: program.iconName || 'BookOpen',
          status: program.status,
        })
        setCarouselImages(
          (program.images || []).map((img) => ({
            key: img.id,
            url: img.url,
            file: null,
          })),
        )
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
    const value = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !slugTouched) next.slug = slugify(value)
      return next
    })
  }

  const uploadCarouselImages = async (items) => {
    const urls = []
    for (const item of items) {
      if (item.file) {
        const formData = new FormData()
        formData.append('image', item.file)
        const res = await api.uploadImage('programs', formData)
        urls.push(res.data.url)
      } else if (item.url) {
        urls.push(item.url)
      }
    }
    return urls
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const carouselUrls = await uploadCarouselImages(carouselImages)

      if (imageFile) {
        const formData = new FormData()
        formData.append('image', imageFile)
        formData.append('slug', form.slug)
        formData.append('title', form.title)
        formData.append('description', form.description)
        formData.append('iconName', form.iconName)
        formData.append('status', form.status)
        formData.append('images', JSON.stringify(carouselUrls))

        if (isEdit) await api.updateProgram(id, formData)
        else await api.createProgram(formData)
      } else {
        const payload = { ...form, images: carouselUrls }
        if (isEdit) await api.updateProgram(id, payload)
        else await api.createProgram(payload)
      }

      toast({ message: isEdit ? 'Program updated.' : 'Program created.' })
      navigate('/programs')
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
        title={isEdit ? 'Edit program' : 'New program'}
        description="Define a program page for the public website."
        actions={
          <Link to="/programs">
            <Button variant="outline">Cancel</Button>
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Program details" description="Name, URL slug, and description.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Program title</Label>
                <Input id="title" required value={form.title} onChange={update('title')} placeholder="Early Childhood Development" />
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
                  placeholder="ecd"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <span className="text-xs text-muted-foreground">{form.description.length} chars</span>
              </div>
              <Textarea id="description" required rows={6} value={form.description} onChange={update('description')} placeholder="Describe the program's goals and impact…" />
            </div>
          </FormSection>

          <FormSection title="Media & publishing" description="Upload a cover photo or use an external URL.">
            <ImageUploadField
              label="Cover image"
              file={imageFile}
              previewSrc={localPreview}
              onFileChange={setImageFile}
              onClearFile={() => setImageFile(null)}
              existingUrl={form.imageUrl}
              onExistingUrlChange={(value) => setForm((prev) => ({ ...prev, imageUrl: value }))}
            />

            <div className="mt-6">
              <ProgramImagesEditor images={carouselImages} onChange={setCarouselImages} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="iconName">Program icon</Label>
                <Select id="iconName" value={form.iconName} onChange={update('iconName')}>
                  {ICON_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, iconName: value }))}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors ${
                    form.iconName === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
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
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create program'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/programs')}>
              Cancel
            </Button>
          </div>
        </form>

        <aside className="hidden xl:block">
          <div className="sticky top-20 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
            <ProgramPreview form={form} previewSrc={localPreview} />
          </div>
        </aside>
      </div>
    </div>
  )
}
