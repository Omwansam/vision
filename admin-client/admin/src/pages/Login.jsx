import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Shield, Users, Heart, FileText } from 'lucide-react'
import { Alert, LoadingSpinner } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label, PasswordInput } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import { ApiError, useAuth } from '@/context/AuthContext'
import { IDLE_LOGOUT_KEY } from '@/hooks/useIdleTimeout'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true'

const features = [
  { icon: FileText, label: 'Content management', desc: 'News, programs & gallery' },
  { icon: Users, label: 'Submissions', desc: 'Contact & volunteer forms' },
  { icon: Heart, label: 'Donations', desc: 'Track giving & payments' },
  { icon: Shield, label: 'Role-based access', desc: 'Secure staff accounts' },
]

export default function Login() {
  const { loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(USE_MOCK ? 'admin@vmg.local' : 'admin@visionmentorsgroup.org')
  const [password, setPassword] = useState(USE_MOCK ? 'admin123' : '')
  const [error, setError] = useState('')
  const [idleNotice, setIdleNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from || '/'

  useEffect(() => {
    if (sessionStorage.getItem(IDLE_LOGOUT_KEY)) {
      sessionStorage.removeItem(IDLE_LOGOUT_KEY)
      setIdleNotice('Your session ended due to inactivity. Please sign in again.')
    }
  }, [])

  if (loading) return <LoadingSpinner className="min-h-screen" />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="login-pattern relative hidden w-[45%] flex-col justify-between overflow-hidden p-10 text-primary-foreground lg:flex xl:w-[42%]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />

        <Logo
          size="lg"
          subtitle="Admin Portal"
          className="relative [&_p]:text-primary-foreground [&_p:last-child]:text-primary-foreground/75"
        />

        <div className="relative space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              Empowering communities through mentorship
            </h1>
            <p className="mt-4 max-w-md text-primary-foreground/85">
              Manage your organization&apos;s digital presence, review submissions, and coordinate programs from one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-primary-foreground/75">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Vision Mentors Group. All rights reserved. Developed by Draftbit Studios.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="lg" />
          </div>

          <Card className="border-border/80 shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                {USE_MOCK
                  ? 'Local mock login — credentials are stored in this browser.'
                  : 'Sign in with your staff account to continue.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {idleNotice && <Alert variant="warning">{idleNotice}</Alert>}
                {error && <Alert>{error}</Alert>}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@visionmentorsgroup.org"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign in to admin'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
