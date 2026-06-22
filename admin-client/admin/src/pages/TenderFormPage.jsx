import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Calendar, FileText, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { deadlineLabel, formatDate } from '@/lib/utils'
import { Alert, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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

function TenderPreview({ form }) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <CardHeader className="border-b border-border/60 bg-gradient-to-br from-primary/8 to-transparent">
        <p className="font-mono text-xs font-semibold text-primary">{form.referenceId || 'REF-000'}</p>
        <CardTitle className="mt-2 text-lg leading-snug">{form.title || 'Tender title'}</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={form.status} />
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">{form.category}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{form.description || 'Tender description…'}</p>
        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Published {form.publishedAt ? formatDate(form.publishedAt) : '—'}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Deadline {form.deadline ? formatDate(form.deadline) : '—'}
            {form.deadline && form.status === 'open' && (
              <span className="ml-auto font-medium text-amber-700">{deadlineLabel(form.deadline)}</span>
            )}
          </div>
          {form.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {form.location}
            </div>
          )}
          {form.budgetLabel && (
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Budget: {form.budgetLabel}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
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
    if (!isEdit) {
      const today = new Date().toISOString().slice(0, 10)
      setForm((prev) => ({ ...prev, publishedAt: today }))
      return
    }

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
        description="Create or update a procurement opportunity for vendors."
        actions={
          <Link to="/tenders">
            <Button variant="outline">Cancel</Button>
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Reference & category" description="Unique reference number and tender type.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="referenceId">Reference ID</Label>
                <Input id="referenceId" required value={form.referenceId} onChange={update('referenceId')} placeholder="VMG-T-2026-001" />
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
          </FormSection>

          <FormSection title="Tender details">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={form.title} onChange={update('title')} placeholder="Supply and delivery of…" />
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" required rows={6} value={form.description} onChange={update('description')} placeholder="Full tender scope and requirements…" />
            </div>
          </FormSection>

          <FormSection title="Schedule & location" description="Publication date, submission deadline, and venue.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="publishedAt">Published date</Label>
                <Input id="publishedAt" type="date" required value={form.publishedAt} onChange={update('publishedAt')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Submission deadline</Label>
                <Input id="deadline" type="date" required value={form.deadline} onChange={update('deadline')} />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={update('location')} placeholder="Nairobi, Kenya" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetLabel">Budget range</Label>
                <Input id="budgetLabel" value={form.budgetLabel} onChange={update('budgetLabel')} placeholder="KES 1,200,000 – 1,500,000" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Status">
            <div className="space-y-2">
              <Label htmlFor="status">Tender status</Label>
              <Select id="status" value={form.status} onChange={update('status')}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </FormSection>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create tender'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/tenders')}>
              Cancel
            </Button>
          </div>
        </form>

        <aside className="hidden xl:block">
          <div className="sticky top-20 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
            <TenderPreview form={form} />
          </div>
        </aside>
      </div>
    </div>
  )
}
