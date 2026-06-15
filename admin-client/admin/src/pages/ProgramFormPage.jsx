import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Alert, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'

const emptyForm = {
  slug: '',
  title: '',
  description: '',
  imageUrl: '',
  iconName: 'BookOpen',
  status: 'draft',
}

export default function ProgramFormPage() {
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
      if (isEdit) await api.updateProgram(id, form)
      else await api.createProgram(form)
      navigate('/programs')
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
        title={isEdit ? 'Edit program' : 'New program'}
        actions={
          <Link to="/programs" className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm hover:bg-muted">
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
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" required rows={5} value={form.description} onChange={update('description')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={form.imageUrl} onChange={update('imageUrl')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iconName">Icon name</Label>
            <Input id="iconName" value={form.iconName} onChange={update('iconName')} />
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
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create program'}
        </Button>
      </form>
    </div>
  )
}
