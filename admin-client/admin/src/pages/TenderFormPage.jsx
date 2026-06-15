import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Alert, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'

const emptyForm = {
  referenceId: '',
  title: '',
  description: '',
  category: 'goods',
  status: 'open',
  publishedAt: '',
  deadline: '',
  location: '',
  budgetLabel: '',
}

export default function TenderFormPage() {
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
        const res = await api.getTenders({ limit: 100 })
        const tender = res.data.find((t) => t.id === id)
        if (!tender) throw new Error('Tender not found')
        setForm({
          referenceId: tender.referenceId,
          title: tender.title,
          description: tender.description || '',
          category: tender.category,
          status: tender.status,
          publishedAt: tender.publishedAt?.slice(0, 10) || '',
          deadline: tender.deadline?.slice(0, 10) || '',
          location: tender.location || '',
          budgetLabel: tender.budgetLabel || '',
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

    const payload = {
      ...form,
      publishedAt: new Date(form.publishedAt).toISOString(),
      deadline: new Date(form.deadline).toISOString(),
    }

    try {
      if (isEdit) await api.updateTender(id, payload)
      else await api.createTender(payload)
      navigate('/tenders')
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
        title={isEdit ? 'Edit tender' : 'New tender'}
        actions={
          <Link to="/tenders" className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm hover:bg-muted">
            Cancel
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="referenceId">Reference ID</Label>
            <Input id="referenceId" required value={form.referenceId} onChange={update('referenceId')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={form.category} onChange={update('category')}>
              <option value="goods">Goods</option>
              <option value="works">Works</option>
              <option value="services">Services</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={update('title')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" required rows={5} value={form.description} onChange={update('description')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="publishedAt">Published date</Label>
            <Input id="publishedAt" type="date" required value={form.publishedAt} onChange={update('publishedAt')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" required value={form.deadline} onChange={update('deadline')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={update('location')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetLabel">Budget</Label>
            <Input id="budgetLabel" value={form.budgetLabel} onChange={update('budgetLabel')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={form.status} onChange={update('status')}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create tender'}
        </Button>
      </form>
    </div>
  )
}
