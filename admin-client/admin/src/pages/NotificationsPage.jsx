import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Send,
  Bell,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Megaphone,
  Zap,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateTime, paginateClient } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { MiniStat } from '@/components/content/ContentToolbar'
import { useToast } from '@/components/ui/Toast'
import { Tabs } from '@/components/ui/Tabs'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'
import { cn } from '@/lib/utils'

function EmailStatusBanner({ configured, fromAddress }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        configured
          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/30'
          : 'border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/30',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
          )}
        >
          {configured ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>
        <div>
          <p className={cn('font-semibold', configured ? 'text-emerald-900' : 'text-amber-900')}>
            {configured ? 'Email service is ready' : 'Email service not configured'}
          </p>
          <p className={cn('mt-0.5 text-sm', configured ? 'text-emerald-800/80' : 'text-amber-800/80')}>
            {configured
              ? `Outbound mail is enabled${fromAddress ? ` · sending from ${fromAddress}` : ''}`
              : 'Check SMTP settings in your backend environment before sending.'}
          </p>
        </div>
      </div>
      <Badge variant={configured ? 'completed' : 'pending'}>{configured ? 'Connected' : 'Setup required'}</Badge>
    </div>
  )
}

function NewsletterPreview({ subject, body }) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-md">
      <CardHeader className="border-b border-border/60 bg-gradient-to-br from-primary/10 to-transparent">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
        <CardTitle className="mt-2 text-base leading-snug">{subject || 'Newsletter subject line'}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {body || 'Your newsletter content will appear here…'}
        </p>
      </CardContent>
    </Card>
  )
}

function LogGridCard({ log }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-primary">{log.recipient}</p>
          <p className="mt-1 truncate text-sm font-medium">{log.subject || '—'}</p>
        </div>
        <Badge variant={log.status === 'sent' ? 'completed' : log.status === 'failed' ? 'failed' : 'pending'} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="capitalize">{log.type?.replace(/_/g, ' ')}</span>
        <span>{formatDateTime(log.createdAt)}</span>
      </div>
    </article>
  )
}

function CampaignGridCard({ campaign }) {
  return (
    <article className="rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="border-b border-border/60 bg-gradient-to-br from-blue-500/8 to-transparent px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 font-semibold leading-snug">{campaign.subject}</p>
          </div>
          <Badge variant={campaign.status === 'sent' ? 'completed' : 'pending'} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Sent</p>
          <p className="mt-1 font-semibold tabular-nums">{campaign.sentCount ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Recipients</p>
          <p className="mt-1 font-semibold tabular-nums">{campaign.totalRecipients ?? '—'}</p>
        </div>
        <div className="col-span-2 text-xs text-muted-foreground">
          {formatDateTime(campaign.createdAt)}
        </div>
      </div>
    </article>
  )
}

function AlertGridCard({ sub }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <p className="truncate font-medium">{sub.email}</p>
        </div>
        <Badge variant={sub.isActive ? 'subscribed' : 'unsubscribed'}>
          {sub.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Subscribed {formatDateTime(sub.subscribedAt || sub.createdAt)}
      </p>
    </article>
  )
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState('compose')
  const [status, setStatus] = useState(null)
  const [logs, setLogs] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [tenderAlerts, setTenderAlerts] = useState([])
  const [logPage, setLogPage] = useState(1)
  const [alertPage, setAlertPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [newsletter, setNewsletter] = useState({ subject: '', body: '' })
  const [testEmail, setTestEmail] = useState('')

  const loadStatus = useCallback(async () => {
    try {
      const res = await api.getEmailStatus()
      setStatus(res.data)
    } catch {
      setStatus({ configured: false })
    }
  }, [])

  const loadLogs = useCallback(async () => {
    try {
      const res = await api.getEmailLogs({ limit: 100 })
      setLogs(res.data || [])
    } catch (err) {
      toast({ message: err.message, variant: 'error' })
    }
  }, [toast])

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await api.getNewsletterCampaigns({ limit: 50 })
      setCampaigns(res.data || [])
    } catch {
      // optional
    }
  }, [])

  const loadTenderAlerts = useCallback(async () => {
    try {
      const res = await api.getTenderAlertSubscribers({ limit: 100, active: 'true' })
      setTenderAlerts(res.data || [])
    } catch {
      // optional
    }
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadStatus(), loadLogs(), loadCampaigns(), loadTenderAlerts()])
      setLoading(false)
    }
    init()
  }, [loadStatus, loadLogs, loadCampaigns, loadTenderAlerts])

  const logPaged = useMemo(() => paginateClient(logs, logPage, 12), [logs, logPage])
  const alertPaged = useMemo(() => paginateClient(tenderAlerts, alertPage, 12), [tenderAlerts, alertPage])

  const sentLogs = useMemo(() => logs.filter((l) => l.status === 'sent').length, [logs])
  const sentCampaigns = useMemo(() => campaigns.filter((c) => c.status === 'sent').length, [campaigns])

  const handleSendNewsletter = async (e) => {
    e.preventDefault()
    if (!window.confirm('Send this newsletter to all active subscribers?')) return
    setSubmitting(true)
    try {
      const res = await api.sendNewsletter(newsletter)
      toast({ message: res.message || 'Newsletter sent successfully.' })
      setNewsletter({ subject: '', body: '' })
      loadCampaigns()
      loadLogs()
    } catch (err) {
      toast({ message: err.message, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendTest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const recipient = testEmail || user?.email
      await api.sendTestEmail(recipient)
      toast({ message: `Test email sent to ${recipient}` })
      loadLogs()
    } catch (err) {
      toast({ message: err.message, variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    { id: 'compose', label: 'Compose' },
    { id: 'logs', label: 'Email logs' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'alerts', label: 'Tender alerts' },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Email & notifications"
        description="Send newsletters, verify delivery, and manage tender alert subscriptions."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          label="Service status"
          value={status?.configured ? 'Ready' : 'Off'}
          accent={status?.configured ? 'green' : 'amber'}
        />
        <MiniStat label="Emails sent" value={sentLogs} accent="blue" />
        <MiniStat label="Campaigns" value={sentCampaigns} accent="purple" />
        <MiniStat label="Tender alerts" value={tenderAlerts.length} accent="amber" />
      </div>

      <div className="mb-6">
        <EmailStatusBanner configured={status?.configured} fromAddress={status?.from} />
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'compose' && (
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <FormSection title="Newsletter broadcast" description="Send to all active newsletter subscribers.">
              <form onSubmit={handleSendNewsletter} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    required
                    value={newsletter.subject}
                    onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
                    placeholder="March 2026 program update"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message body</Label>
                  <Textarea
                    id="body"
                    required
                    rows={10}
                    value={newsletter.body}
                    onChange={(e) => setNewsletter({ ...newsletter, body: e.target.value })}
                    placeholder="Write your newsletter content…"
                  />
                </div>
                <Button type="submit" disabled={submitting || !status?.configured}>
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending…' : 'Send newsletter'}
                </Button>
              </form>
            </FormSection>

            <FormSection title="Test email" description="Verify SMTP configuration with a test message.">
              <form onSubmit={handleSendTest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Recipient</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder={user?.email || 'admin@example.com'}
                  />
                </div>
                <Button type="submit" variant="outline" disabled={submitting || !status?.configured}>
                  <Zap className="h-4 w-4" />
                  {submitting ? 'Sending…' : 'Send test email'}
                </Button>
              </form>
            </FormSection>
          </div>

          <aside className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Newsletter preview
              </p>
              <NewsletterPreview subject={newsletter.subject} body={newsletter.body} />
            </div>
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Before you send
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-foreground">
                Newsletters go to all active subscribers from Submissions → Newsletter. Use a test email first to confirm formatting and delivery.
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {tab === 'logs' && (
        <>
          {logs.length === 0 ? (
            <EmptyState title="No email logs" icon={Inbox} description="Sent emails will appear here." />
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Recipient</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Subject</TableHeader>
                      <TableHeader>Sent</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {logPaged.data.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.recipient}</TableCell>
                        <TableCell className="capitalize">{log.type?.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === 'sent' ? 'completed' : log.status === 'failed' ? 'failed' : 'pending'
                            }
                          />
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">{log.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-4 lg:hidden">
                {logPaged.data.map((log) => (
                  <LogGridCard key={log.id} log={log} />
                ))}
              </div>
              <Pagination page={logPaged.page} pages={logPaged.pages} onPageChange={setLogPage} />
            </>
          )}
        </>
      )}

      {tab === 'campaigns' && (
        <>
          {campaigns.length === 0 ? (
            <EmptyState
              title="No campaigns yet"
              icon={Send}
              description="Send your first newsletter to create a campaign record."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((c) => (
                <CampaignGridCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'alerts' && (
        <>
          {tenderAlerts.length === 0 ? (
            <EmptyState
              title="No active subscribers"
              icon={Bell}
              description="Tender alert subscriptions from the public site will appear here."
            />
          ) : (
            <>
              <div className="mb-4 hidden lg:block">
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Email</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Subscribed</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {alertPaged.data.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.email}</TableCell>
                        <TableCell>
                          <Badge variant={sub.isActive ? 'subscribed' : 'unsubscribed'}>
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(sub.subscribedAt || sub.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:hidden">
                {alertPaged.data.map((sub) => (
                  <AlertGridCard key={sub.id} sub={sub} />
                ))}
              </div>
              <Pagination page={alertPaged.page} pages={alertPaged.pages} onPageChange={setAlertPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
