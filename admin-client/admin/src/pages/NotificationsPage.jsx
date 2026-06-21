import { useCallback, useEffect, useState } from 'react'
import { Mail, Send, Bell, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState, FormSection, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { useToast } from '@/components/ui/Toast'
import { Tabs } from '@/components/ui/Tabs'
import { Input, Label, Textarea } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'

function StatusIndicator({ configured }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
        configured ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
      }`}
    >
      {configured ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {configured ? 'Email service is configured and ready' : 'Email service is not configured — check SMTP settings'}
    </div>
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
  const [logPages, setLogPages] = useState(1)
  const [alertPage, setAlertPage] = useState(1)
  const [alertPages, setAlertPages] = useState(1)
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
      const res = await api.getEmailLogs({ page: logPage, limit: 15 })
      setLogs(res.data)
      setLogPages(res.pages)
    } catch (err) {
      toast({ message: err.message, variant: 'error' })
    }
  }, [logPage, toast])

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await api.getNewsletterCampaigns({ limit: 10 })
      setCampaigns(res.data)
    } catch {
      // optional
    }
  }, [])

  const loadTenderAlerts = useCallback(async () => {
    try {
      const res = await api.getTenderAlertSubscribers({ page: alertPage, limit: 15, active: 'true' })
      setTenderAlerts(res.data)
      setAlertPages(res.pages)
    } catch {
      // optional
    }
  }, [alertPage])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadStatus(), loadLogs(), loadCampaigns(), loadTenderAlerts()])
      setLoading(false)
    }
    init()
  }, [loadStatus, loadLogs, loadCampaigns, loadTenderAlerts])

  useEffect(() => {
    if (!loading) loadLogs()
  }, [logPage, loadLogs, loading])

  useEffect(() => {
    if (!loading) loadTenderAlerts()
  }, [alertPage, loadTenderAlerts, loading])

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
        description="Send newsletters, test email delivery, and manage alert subscriptions."
      />

      <div className="mb-6">
        <StatusIndicator configured={status?.configured} />
        {status?.from && (
          <p className="mt-2 text-xs text-muted-foreground">Sending from: {status.from}</p>
        )}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'compose' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <FormSection title="Newsletter broadcast" description="Send to all active newsletter subscribers.">
            <form onSubmit={handleSendNewsletter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  required
                  value={newsletter.subject}
                  onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
                  placeholder="Your newsletter subject line"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message body</Label>
                <Textarea
                  id="body"
                  required
                  rows={8}
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
                <Mail className="h-4 w-4" />
                {submitting ? 'Sending…' : 'Send test email'}
              </Button>
            </form>
          </FormSection>
        </div>
      )}

      {tab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent email activity</CardTitle>
            <CardDescription>Delivery logs for all outbound emails.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <EmptyState title="No email logs" icon={Mail} description="Sent emails will appear here." />
            ) : (
              <>
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
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.recipient}</TableCell>
                        <TableCell className="capitalize">{log.type?.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'sent' ? 'completed' : log.status === 'failed' ? 'failed' : 'pending'} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.subject}</TableCell>
                        <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="px-4 pb-4">
                  <Pagination page={logPage} pages={logPages} onPageChange={setLogPage} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'campaigns' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Newsletter campaigns</CardTitle>
            <CardDescription>Past newsletter broadcasts.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {campaigns.length === 0 ? (
              <EmptyState title="No campaigns yet" icon={Send} description="Send your first newsletter to create a campaign." />
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Subject</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Sent</TableHeader>
                    <TableHeader>Recipients</TableHeader>
                    <TableHeader>Date</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.subject}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'sent' ? 'completed' : 'pending'} />
                      </TableCell>
                      <TableCell>{c.sentCount ?? '—'}</TableCell>
                      <TableCell>{c.totalRecipients ?? '—'}</TableCell>
                      <TableCell>{formatDateTime(c.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Tender alert subscribers
            </CardTitle>
            <CardDescription>Users subscribed to new tender notifications.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {tenderAlerts.length === 0 ? (
              <EmptyState title="No active subscribers" icon={Bell} description="Tender alert subscriptions will appear here." />
            ) : (
              <>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeader>Email</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Subscribed</TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {tenderAlerts.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>
                          {sub.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <XCircle className="h-3.5 w-3.5" /> Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(sub.subscribedAt || sub.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="px-4 pb-4">
                  <Pagination page={alertPage} pages={alertPages} onPageChange={setAlertPage} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
