import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { api } from '@/lib/api'

export function NewsletterSignup({ variant = 'footer' }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    setError('')
    try {
      await api.subscribeNewsletter({ email: email.trim(), source: variant === 'footer' ? 'footer' : 'website' })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Subscription failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p className={`text-sm ${variant === 'footer' ? 'text-white/80' : 'text-muted-foreground'}`}>
        Thank you for subscribing. We'll keep you updated on our impact.
      </p>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail
            size={16}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${variant === 'footer' ? 'text-white/50' : 'text-muted-foreground'}`}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border ${
              variant === 'footer'
                ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30'
                : 'bg-background border-border focus:ring-2 focus:ring-primary'
            }`}
          />
        </div>
        <Button type="submit" variant={variant === 'footer' ? 'secondary' : 'default'} className="shrink-0" disabled={submitting}>
          {submitting ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>
      {error && <p className={`text-xs mt-2 ${variant === 'footer' ? 'text-white/70' : 'text-destructive'}`}>{error}</p>}
    </div>
  )
}
