import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Shield, Mail, User } from 'lucide-react'
import { api } from '@/lib/api'
import { Alert, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, PasswordInput } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'editor',
}

const ROLES = [
  {
    id: 'admin',
    label: 'Administrator',
    description: 'Full access to all sections',
    accent: 'border-purple-200 bg-purple-50/50 hover:border-purple-300',
    active: 'border-purple-400 ring-2 ring-purple-200',
  },
  {
    id: 'editor',
    label: 'Editor',
    description: 'Content, submissions, and email',
    accent: 'border-blue-200 bg-blue-50/50 hover:border-blue-300',
    active: 'border-blue-400 ring-2 ring-blue-200',
  },
  {
    id: 'procurement',
    label: 'Procurement',
    description: 'Tenders only',
    accent: 'border-orange-200 bg-orange-50/50 hover:border-orange-300',
    active: 'border-orange-400 ring-2 ring-orange-200',
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Donations only',
    accent: 'border-teal-200 bg-teal-50/50 hover:border-teal-300',
    active: 'border-teal-400 ring-2 ring-teal-200',
  },
]

function UserPreview({ form }) {
  const initials = (form.name || 'New User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <CardHeader className="border-b border-border/60 bg-gradient-to-br from-purple-500/10 to-transparent text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {initials}
        </div>
        <CardTitle className="mt-4 text-lg">{form.name || 'Staff member'}</CardTitle>
        <p className="text-sm text-muted-foreground">{form.email || 'email@example.com'}</p>
        <div className="mt-3 flex justify-center">
          <Badge variant={form.role} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 shrink-0 text-primary" />
          {ROLES.find((r) => r.id === form.role)?.description}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-primary" />
          Login with organization email
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 shrink-0 text-primary" />
          Role-based sidebar access
        </div>
      </CardContent>
    </Card>
  )
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

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Account details" description="Basic login credentials for this staff member.">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={form.name} onChange={update('name')} placeholder="Jane Wanjiru" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  placeholder="jane@visionmentorsgroup.org"
                />
              </div>
              {!isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    required
                    value={form.password}
                    onChange={update('password')}
                    placeholder="Minimum 8 characters"
                  />
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Role & permissions" description="Choose what this user can access in the admin portal.">
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: role.id }))}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    role.accent,
                    form.role === role.id && role.active,
                  )}
                >
                  <p className="font-semibold">{role.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{role.description}</p>
                </button>
              ))}
            </div>
          </FormSection>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/users')}>
              Cancel
            </Button>
          </div>
        </form>

        <aside className="hidden xl:block">
          <div className="sticky top-20 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
            <UserPreview form={form} />
          </div>
        </aside>
      </div>
    </div>
  )
}
