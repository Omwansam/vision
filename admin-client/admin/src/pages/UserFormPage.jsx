import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import { Alert, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'editor',
}

const roleDescriptions = {
  admin: 'Full access to all sections',
  editor: 'Content, submissions, and email',
  procurement: 'Tenders only',
  finance: 'Donations only',
}

export default function UserFormPage() {
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
        const res = await api.getUsers()
        const user = res.data.find((u) => u.id === id)
        if (!user) throw new Error('User not found')
        setForm({ name: user.name, email: user.email, password: '', role: user.role })
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
      if (isEdit) {
        const payload = { name: form.name, email: form.email, role: form.role }
        await api.updateUser(id, payload)
      } else {
        if (!form.password) throw new Error('Password is required')
        await api.createUser(form)
      }
      navigate('/users')
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
        title={isEdit ? 'Edit user' : 'New user'}
        description="Create or update a staff account with role-based access."
        actions={
          <Link to="/users">
            <Button variant="outline">Cancel</Button>
          </Link>
        }
      />

      {error && <Alert className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <FormSection title="Account details">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={update('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={update('email')} />
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required={!isEdit} value={form.password} onChange={update('password')} />
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Role & permissions">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={form.role} onChange={update('role')}>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="procurement">Procurement</option>
              <option value="finance">Finance</option>
            </Select>
            <p className="text-xs text-muted-foreground">{roleDescriptions[form.role]}</p>
          </div>
        </FormSection>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/users')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
