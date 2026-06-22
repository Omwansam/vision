import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Eye,
  Inbox,
  Users,
  Handshake,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Building2,
  User,
} from 'lucide-react'
import { api } from '@/lib/api'
import {
  countByStatus,
  filterSubmissions,
  formatDateTime,
  paginateClient,
  truncate,
} from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ContentToolbar, MiniStat } from '@/components/content/ContentToolbar'
import { Modal } from '@/components/ui/Modal'
import { Label, Select } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'
import { cn } from '@/lib/utils'

const SUBMISSION_TABS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'archived', label: 'Archived' },
]

const STATUS_OPTIONS = ['new', 'in_progress', 'resolved', 'archived']

const NEWSLETTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'subscribed', label: 'Subscribed' },
  { id: 'unsubscribed', label: 'Unsubscribed' },
  { id: 'bounced', label: 'Bounced' },
]

const CONTACT_SUBJECT_LABELS = {
  donation: 'Donation inquiry',
  volunteer: 'Volunteering',
  partnership: 'Partnership',
  program: 'Program information',
  feedback: 'Feedback',
  media: 'Media inquiry',
  other: 'Other',
}

const VOLUNTEER_ROLE_LABELS = {
  food_distribution: 'Food distribution',
  community_liaison: 'Community liaison',
  logistics_support: 'Logistics support',
  impact_documentation: 'Impact documentation',
  translation: 'Translation',
  administration: 'Administration',
  other: 'Other',
}

const PARTNERSHIP_TYPE_LABELS = {
  corporate: 'Corporate',
  supply_chain: 'Supply chain',
  technology: 'Technology',
  research: 'Research',
  advocacy: 'Advocacy',
  other: 'Other',
}

const CARD_THEMES = {
  contact: 'from-blue-500/10 via-transparent to-primary/5',
  volunteer: 'from-emerald-500/10 via-transparent to-primary/5',
  partnership: 'from-purple-500/10 via-transparent to-primary/5',
  newsletter: 'from-primary/10 via-transparent to-secondary/5',
}

function formatLabel(value, labels = {}) {
  if (!value) return '—'
  return labels[value] || value.replace(/_/g, ' ')
}

function DetailField({ label, value, icon: Icon, className }) {
  if (!value) return null
  return (
    <div className={cn('rounded-lg border border-border/60 bg-muted/20 p-3', className)}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function SubmissionGridCard({ item, theme, icon: Icon, name, subtitle, preview, onView }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className={cn('border-b border-border/60 bg-gradient-to-br px-5 py-4', CARD_THEMES[theme])}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold leading-snug">{name}</p>
              {subtitle && (
                <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <Badge variant={item.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {item.email && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{item.email}</span>
          </p>
        )}
        {preview && (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {truncate(preview, 140)}
          </p>
        )}
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDateTime(item.createdAt)}
        </p>
        <div className="mt-4 border-t border-border pt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onView(item)}>
            <Eye className="h-3.5 w-3.5" />
            View details
          </Button>
        </div>
      </div>
    </article>
  )
}

function SubmissionDetailModal({ item, open, onClose, renderDetail, onStatusChange, saving }) {
  if (!item) return null

  return (
    <Modal open={open} onClose={onClose} title="Submission details" className="max-w-lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-gradient-to-br from-primary/8 to-transparent p-4">
          <div>
            <p className="text-lg font-semibold">{item.fullName || item.contactName || item.organizationName}</p>
            {item.email && <p className="mt-1 text-sm text-muted-foreground">{item.email}</p>}
          </div>
          <Badge variant={item.status} />
        </div>

        <div className="space-y-3">{renderDetail(item)}</div>

        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
          <Label htmlFor="submission-status">Update status</Label>
          <Select
            id="submission-status"
            value={item.status}
            disabled={saving}
            onChange={(e) => onStatusChange(item.id, e.target.value)}
            className="w-full"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </div>

        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}

function SubmissionsPage({
  title,
  description,
  fetchFn,
  updateFn,
  theme,
  icon,
  getName,
  getSubtitle,
  getPreview,
  renderDetail,
  searchPlaceholder = 'Search submissions…',
}) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('grid')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchFn({ limit: 100 })
      setItems(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [search, status])

  const counts = useMemo(() => countByStatus(items), [items])

  const filtered = useMemo(
    () => filterSubmissions(items, { search, status }),
    [items, search, status],
  )

  const paged = useMemo(() => paginateClient(filtered, page, 12), [filtered, page])

  const handleStatusChange = async (id, newStatus) => {
    setSaving(true)
    setError('')
    try {
      await updateFn(id, newStatus)
      await load()
      setSelected((prev) => (prev?.id === id ? { ...prev, status: newStatus } : prev))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title={title} description={description} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total" value={counts.total} accent="blue" />
        <MiniStat label="New" value={counts.new} accent="amber" />
        <MiniStat label="In progress" value={counts.in_progress} accent="purple" />
        <MiniStat label="Resolved" value={counts.resolved} accent="green" />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      <ContentToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        view={view}
        onViewChange={setView}
        counts={counts}
        tabs={SUBMISSION_TABS}
        placeholder={searchPlaceholder}
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching submissions' : 'No submissions yet'}
          description={
            items.length
              ? 'Try a different search or filter.'
              : 'New form submissions will appear here.'
          }
          icon={icon}
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paged.data.map((item) => (
              <SubmissionGridCard
                key={item.id}
                item={item}
                theme={theme}
                icon={icon}
                name={getName(item)}
                subtitle={getSubtitle?.(item)}
                preview={getPreview?.(item)}
                onView={setSelected}
              />
            ))}
          </div>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Summary</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Received</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {paged.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{getName(item)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.email}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {getSubtitle?.(item) || truncate(getPreview?.(item), 60)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(item)}>
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
      )}

      <SubmissionDetailModal
        item={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        renderDetail={renderDetail}
        onStatusChange={handleStatusChange}
        saving={saving}
      />
    </div>
  )
}

export function ContactSubmissionsPage() {
  return (
    <SubmissionsPage
      title="Contact submissions"
      description="Messages from the public contact form — review, respond, and track resolution."
      theme="contact"
      icon={Inbox}
      fetchFn={api.getContacts}
      updateFn={api.updateContactStatus}
      searchPlaceholder="Search names, emails, subjects…"
      getName={(item) => item.fullName}
      getSubtitle={(item) => formatLabel(item.subject, CONTACT_SUBJECT_LABELS)}
      getPreview={(item) => item.message}
      renderDetail={(item) => (
        <>
          <DetailField label="Name" value={item.fullName} icon={User} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Email" value={item.email} icon={Mail} />
            <DetailField label="Phone" value={item.phone} icon={Phone} />
          </div>
          <DetailField
            label="Subject"
            value={formatLabel(item.subject, CONTACT_SUBJECT_LABELS)}
            icon={MessageSquare}
          />
          <DetailField label="Message" value={item.message} icon={Inbox} />
        </>
      )}
    />
  )
}

export function VolunteerSubmissionsPage() {
  return (
    <SubmissionsPage
      title="Volunteer applications"
      description="Applications from the get-involved page — track interest and onboarding."
      theme="volunteer"
      icon={Users}
      fetchFn={api.getVolunteers}
      updateFn={api.updateVolunteerStatus}
      searchPlaceholder="Search applicants, roles, availability…"
      getName={(item) => item.fullName}
      getSubtitle={(item) => formatLabel(item.preferredRole, VOLUNTEER_ROLE_LABELS)}
      getPreview={(item) => item.message || item.availability}
      renderDetail={(item) => (
        <>
          <DetailField label="Applicant" value={item.fullName} icon={User} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Email" value={item.email} icon={Mail} />
            <DetailField label="Phone" value={item.phone} icon={Phone} />
          </div>
          <DetailField
            label="Preferred role"
            value={formatLabel(item.preferredRole, VOLUNTEER_ROLE_LABELS)}
            icon={Users}
          />
          <DetailField label="Availability" value={item.availability} icon={Calendar} />
          <DetailField label="Message" value={item.message} icon={MessageSquare} />
        </>
      )}
    />
  )
}

export function PartnershipSubmissionsPage() {
  return (
    <SubmissionsPage
      title="Partnership inquiries"
      description="Partnership requests from organizations — evaluate fit and follow up."
      theme="partnership"
      icon={Handshake}
      fetchFn={api.getPartnerships}
      updateFn={api.updatePartnershipStatus}
      searchPlaceholder="Search organizations, contacts, types…"
      getName={(item) => item.organizationName}
      getSubtitle={(item) => `${item.contactName} · ${formatLabel(item.partnershipType, PARTNERSHIP_TYPE_LABELS)}`}
      getPreview={(item) => item.vision}
      renderDetail={(item) => (
        <>
          <DetailField label="Organization" value={item.organizationName} icon={Building2} />
          <DetailField label="Contact person" value={item.contactName} icon={User} />
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Email" value={item.email} icon={Mail} />
            <DetailField label="Phone" value={item.phone} icon={Phone} />
          </div>
          <DetailField
            label="Partnership type"
            value={formatLabel(item.partnershipType, PARTNERSHIP_TYPE_LABELS)}
            icon={Handshake}
          />
          <DetailField label="Vision & goals" value={item.vision} icon={MessageSquare} />
        </>
      )}
    />
  )
}

function NewsletterGridCard({ item }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className={cn('border-b border-border/60 bg-gradient-to-br px-5 py-4', CARD_THEMES.newsletter)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <p className="truncate font-semibold">{item.email}</p>
          </div>
          <Badge variant={item.status} />
        </div>
      </div>
      <div className="p-5">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Subscribed {formatDateTime(item.createdAt)}
        </p>
      </div>
    </article>
  )
}

export function NewsletterPage() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [view, setView] = useState('grid')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getNewsletterSubscribers({ limit: 100 })
      setItems(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [search, status])

  const counts = useMemo(() => countByStatus(items), [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false
      if (!q) return true
      return item.email?.toLowerCase().includes(q)
    })
  }, [items, search, status])

  const paged = useMemo(() => paginateClient(filtered, page, 12), [filtered, page])

  return (
    <div>
      <PageHeader
        title="Newsletter subscribers"
        description="Email subscribers from the website — use Notifications to send campaigns."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total subscribers" value={counts.total} accent="blue" />
        <MiniStat label="Active" value={counts.subscribed} accent="green" />
        <MiniStat label="Unsubscribed" value={counts.unsubscribed} accent="amber" />
        <MiniStat label="Bounced" value={counts.bounced} accent="purple" />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      <ContentToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        view={view}
        onViewChange={setView}
        counts={counts}
        tabs={NEWSLETTER_TABS}
        placeholder="Search email addresses…"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching subscribers' : 'No subscribers yet'}
          description={
            items.length
              ? 'Try a different search or filter.'
              : 'Newsletter sign-ups from the website will appear here.'
          }
          icon={Mail}
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paged.data.map((item) => (
              <NewsletterGridCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
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
              {paged.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.email}</TableCell>
                  <TableCell>
                    <Badge variant={item.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
