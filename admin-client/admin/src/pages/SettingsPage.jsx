import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Target,
  Sparkles,
  Bell,
  Share2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Inbox,
  FileText,
  Heart,
} from 'lucide-react'
import { api } from '@/lib/api'
import { FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { MiniStat } from '@/components/content/ContentToolbar'
import { useToast } from '@/components/ui/Toast'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

function FieldHint({ children }) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

function EmailRouteCard({ icon: Icon, title, description, email, accent }) {
  const accents = {
    emerald: 'border-emerald-200 bg-emerald-50/80',
    blue: 'border-blue-200 bg-blue-50/80',
    purple: 'border-purple-200 bg-purple-50/80',
  }

  return (
    <div className={cn('rounded-xl border p-4', accents[accent])}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm">
          <Icon className="h-4 w-4 text-foreground/70" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          <p className="mt-2 truncate font-mono text-xs font-medium text-foreground/80">
            {email || 'Not set — add an address below'}
          </p>
        </div>
      </div>
    </div>
  )
}

function SitePreview({ form, tab, emailStatus }) {
  if (!form) return null

  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <CardHeader className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {form.shortName || 'VMG'}
        </p>
        <CardTitle className="mt-2 text-xl leading-snug">{form.name || 'Organization name'}</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">{form.tagline || 'Your tagline appears here'}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {(tab === 'general' || tab === 'contact') && form.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{form.description}</p>
        )}

        {(tab === 'contact' || tab === 'general' || tab === 'email') && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
            {form.email && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {form.email}
              </p>
            )}
            {tab === 'email' && form.tendersEmail && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                {form.tendersEmail}
              </p>
            )}
            {form.phone && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {form.phone}
              </p>
            )}
            {(form.addressLine1 || form.addressLine2) && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{[form.addressLine1, form.addressLine2].filter(Boolean).join(', ')}</span>
              </p>
            )}
            {form.officeHours && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                {form.officeHours}
              </p>
            )}
          </div>
        )}

        {tab === 'email' && emailStatus && (
          <div
            className={cn(
              'rounded-lg border px-3 py-2.5 text-xs',
              emailStatus.configured
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-amber-200 bg-amber-50 text-amber-800',
            )}
          >
            <p className="flex items-center gap-1.5 font-medium">
              {emailStatus.configured ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              SMTP {emailStatus.configured ? 'configured' : 'not configured'}
            </p>
            {emailStatus.from && (
              <p className="mt-1 font-mono text-[11px] opacity-80">From: {emailStatus.from}</p>
            )}
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-2">
            {(form.socialLinks || []).filter((l) => l.isActive !== false && l.label).length === 0 ? (
              <p className="text-sm text-muted-foreground">No social links added yet.</p>
            ) : (
              (form.socialLinks || [])
                .filter((l) => l.isActive !== false && l.label)
                .map((link, i) => (
                  <p key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Share2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{link.label}</span>
                  </p>
                ))
            )}
          </div>
        )}

        {tab === 'mission' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Target className="h-3.5 w-3.5" />
                Mission
              </p>
              <p className="mt-2 text-sm leading-relaxed">{form.mission || 'Mission statement…'}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Vision
              </p>
              <p className="mt-2 text-sm leading-relaxed">{form.vision || 'Vision statement…'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SocialLinksEditor({ links, onChange }) {
  const items = links?.length ? links : [{ label: '', href: '', isActive: true }]

  const update = (index, field, value) => {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    onChange(next)
  }

  const add = () => onChange([...items, { label: '', href: '', isActive: true }])

  const remove = (index) => {
    const next = items.filter((_, i) => i !== index)
    onChange(next.length ? next : [{ label: '', href: '', isActive: true }])
  }

  return (
    <div className="space-y-3">
      {items.map((link, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-xl border border-border bg-muted/10 p-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <div className="space-y-2">
            <Label htmlFor={`social-label-${index}`}>Platform</Label>
            <Input
              id={`social-label-${index}`}
              value={link.label || ''}
              onChange={(e) => update(index, 'label', e.target.value)}
              placeholder="Facebook"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`social-href-${index}`}>URL</Label>
            <Input
              id={`social-href-${index}`}
              type="url"
              value={link.href || ''}
              onChange={(e) => update(index, 'href', e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">
              <input
                type="checkbox"
                checked={link.isActive !== false}
                onChange={(e) => update(index, 'isActive', e.target.checked)}
                className="rounded border-border"
              />
              Active
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Remove link"
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" />
        Add social link
      </Button>
    </div>
  )
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [form, setForm] = useState(null)
  const [emailStatus, setEmailStatus] = useState(null)
  const [tab, setTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [siteRes, statusRes] = await Promise.all([
          api.getSite(),
          api.getEmailStatus().catch(() => ({ data: { configured: false } })),
        ])
        setForm({
          ...siteRes.data,
          socialLinks: siteRes.data.socialLinks?.length
            ? siteRes.data.socialLinks
            : [{ label: '', href: '', isActive: true }],
        })
        setEmailStatus(statusRes.data)
      } catch (err) {
        toast({ message: err.message, variant: 'error' })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [toast])

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const updateSocialLinks = (socialLinks) => {
    setForm((prev) => ({ ...prev, socialLinks }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const socialLinks = (form.socialLinks || [])
        .filter((link) => link.label?.trim() && link.href?.trim())
        .map((link, index) => ({
          label: link.label.trim(),
          href: link.href.trim(),
          isActive: link.isActive !== false,
          sortOrder: index,
        }))

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
        socialLinks,
      })
      setForm({
        ...res.data,
        socialLinks: res.data.socialLinks?.length
          ? res.data.socialLinks
          : [{ label: '', href: '', isActive: true }],
      })
      toast({ message: 'Settings saved successfully.' })
    } catch (err) {
      toast({ message: err.message, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'email', label: 'Email & alerts' },
    { id: 'social', label: 'Social links' },
    { id: 'mission', label: 'Mission & vision' },
  ]

  const activeSocialCount = (form.socialLinks || []).filter(
    (l) => l.isActive !== false && l.label?.trim(),
  ).length

  return (
    <div>
      <PageHeader
        title="Site settings"
        description="Manage your public website identity, contact details, email routing, and social profiles."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Organization" value={form.shortName || 'VMG'} accent="blue" />
        <MiniStat label="Contact email" value={form.email ? 'Set' : 'Missing'} accent="green" />
        <MiniStat
          label="Email delivery"
          value={emailStatus?.configured ? 'Active' : 'Off'}
          accent={emailStatus?.configured ? 'green' : 'amber'}
        />
        <MiniStat label="Social links" value={activeSocialCount} accent="purple" />
      </div>

      {form && (
        <form onSubmit={handleSubmit}>
          <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

          <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {tab === 'general' && (
                <FormSection
                  title="Organization identity"
                  description="Name, tagline, and description shown across the public website."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Organization name</Label>
                      <Input id="name" value={form.name || ''} onChange={update('name')} />
                      <FieldHint>Full legal or public-facing name.</FieldHint>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shortName">Short name / abbreviation</Label>
                      <Input id="shortName" value={form.shortName || ''} onChange={update('shortName')} />
                      <FieldHint>Used in compact spaces (e.g. VMG).</FieldHint>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" value={form.tagline || ''} onChange={update('tagline')} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="description">About description</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      value={form.description || ''}
                      onChange={update('description')}
                    />
                    <FieldHint>Appears in the footer and meta descriptions.</FieldHint>
                  </div>
                </FormSection>
              )}

              {tab === 'contact' && (
                <FormSection
                  title="Contact & location"
                  description="Phone, address, and office hours displayed on the public site."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone || ''} onChange={update('phone')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="officeHours">Office hours</Label>
                      <Input id="officeHours" value={form.officeHours || ''} onChange={update('officeHours')} />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="addressLine1">Address line 1</Label>
                    <Input id="addressLine1" value={form.addressLine1 || ''} onChange={update('addressLine1')} />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="addressLine2">Address line 2</Label>
                    <Input id="addressLine2" value={form.addressLine2 || ''} onChange={update('addressLine2')} />
                  </div>
                </FormSection>
              )}

              {tab === 'email' && (
                <>
                  <Card className="border-border/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="h-4 w-4 text-primary" />
                        Email routing
                      </CardTitle>
                      <CardDescription>
                        These inboxes receive automated notifications from website forms and tender alerts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      <EmailRouteCard
                        icon={Inbox}
                        title="General inbox"
                        description="Contact, volunteer, partnership, and concern form submissions."
                        email={form.email}
                        accent="emerald"
                      />
                      <EmailRouteCard
                        icon={FileText}
                        title="Procurement inbox"
                        description="New tender publications and procurement-related alerts."
                        email={form.tendersEmail}
                        accent="blue"
                      />
                    </CardContent>
                  </Card>

                  <FormSection
                    title="Notification addresses"
                    description="Set the email addresses that receive automated messages from the website."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Contact email</Label>
                        <Input id="email" type="email" value={form.email || ''} onChange={update('email')} />
                        <FieldHint>Primary inbox for general form submissions.</FieldHint>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tendersEmail">Tenders email</Label>
                        <Input
                          id="tendersEmail"
                          type="email"
                          value={form.tendersEmail || ''}
                          onChange={update('tendersEmail')}
                        />
                        <FieldHint>Receives tender alert notifications.</FieldHint>
                      </div>
                    </div>
                  </FormSection>

                  <Card
                    className={cn(
                      'border',
                      emailStatus?.configured
                        ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-transparent'
                        : 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-transparent',
                    )}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {emailStatus?.configured ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        )}
                        Outbound email (SMTP)
                      </CardTitle>
                      <CardDescription>
                        SMTP credentials are configured on the server. This panel shows delivery status only.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">
                          Status:{' '}
                          <span className={emailStatus?.configured ? 'text-emerald-700' : 'text-amber-700'}>
                            {emailStatus?.configured ? 'Configured & ready' : 'Not configured'}
                          </span>
                        </p>
                        {emailStatus?.from && (
                          <p className="font-mono text-xs text-muted-foreground">
                            Sending from: {emailStatus.from}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Newsletter welcomes, form confirmations, donation receipts, and tender alerts use this
                          service.
                        </p>
                      </div>
                      <Link
                        to="/notifications"
                        className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
                      >
                        Manage email
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { icon: Heart, label: 'Donation receipts', desc: 'Sent when a donation is marked complete.' },
                      { icon: Mail, label: 'Newsletter', desc: 'Welcome emails and admin broadcasts.' },
                      { icon: Bell, label: 'Tender alerts', desc: 'Notifies procurement subscribers.' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-border bg-muted/20 px-4 py-3"
                      >
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="h-4 w-4 text-primary" />
                          {label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'social' && (
                <FormSection
                  title="Social media profiles"
                  description="Links shown in the website footer and shared across the public site."
                >
                  <SocialLinksEditor links={form.socialLinks} onChange={updateSocialLinks} />
                </FormSection>
              )}

              {tab === 'mission' && (
                <FormSection
                  title="Mission & vision"
                  description="Your organization's purpose and long-term goals."
                >
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="mission">Mission</Label>
                      <Textarea id="mission" rows={8} value={form.mission || ''} onChange={update('mission')} />
                      <FieldHint>What you do and who you serve today.</FieldHint>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vision">Vision</Label>
                      <Textarea id="vision" rows={8} value={form.vision || ''} onChange={update('vision')} />
                      <FieldHint>The future you are working toward.</FieldHint>
                    </div>
                  </div>
                </FormSection>
              )}
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-20 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live preview
                </p>
                <SitePreview form={form} tab={tab} emailStatus={emailStatus} />
              </div>
            </aside>
          </div>

          <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
            <p className="hidden text-xs text-muted-foreground sm:block">
              Changes apply to the public website after saving.
            </p>
            <Button type="submit" disabled={submitting} className="ml-auto">
              {submitting ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
