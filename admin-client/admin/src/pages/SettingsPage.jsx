import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Alert, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label, Textarea } from '@/components/ui/Input'

export default function SettingsPage() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getSite()
        setForm(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.updateSite({
        name: form.name,
        shortName: form.shortName,
        tagline: form.tagline,
        description: form.description,
        email: form.email,
        tendersEmail: form.tendersEmail,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        officeHours: form.officeHours,
        mission: form.mission,
        vision: form.vision,
      })
      setForm(res.data)
      setSuccess('Settings saved successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Site settings" description="Update organization info shown on the public website." />

      {error && <Alert className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {form && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Organization name</Label>
              <Input id="name" value={form.name || ''} onChange={update('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortName">Short name</Label>
              <Input id="shortName" value={form.shortName || ''} onChange={update('shortName')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={form.tagline || ''} onChange={update('tagline')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description || ''} onChange={update('description')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Contact email</Label>
              <Input id="email" type="email" value={form.email || ''} onChange={update('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone || ''} onChange={update('phone')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input id="addressLine1" value={form.addressLine1 || ''} onChange={update('addressLine1')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mission">Mission</Label>
              <Textarea id="mission" value={form.mission || ''} onChange={update('mission')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vision">Vision</Label>
              <Textarea id="vision" value={form.vision || ''} onChange={update('vision')} />
            </div>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save settings'}
          </Button>
        </form>
      )}
    </div>
  )
}
