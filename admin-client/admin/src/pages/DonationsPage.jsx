import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Heart,
  Mail,
  User,
  CreditCard,
  Eye,
  Banknote,
} from 'lucide-react'
import { api } from '@/lib/api'
import {
  countByStatus,
  filterContentItems,
  formatCurrency,
  formatDateTime,
  paginateClient,
} from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ContentToolbar, MiniStat } from '@/components/content/ContentToolbar'
import { Modal } from '@/components/ui/Modal'
import { Label, Select } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'

const DONATION_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'cancelled', label: 'Cancelled' },
]

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']

const DESIGNATION_LABELS = {
  general: 'General fund',
  ecd: 'Early childhood development',
  food: 'Food security',
  health: 'Health programs',
  education: 'Education',
}

function formatType(type) {
  return type?.replace(/_/g, ' ') || '—'
}

function formatDesignation(designation) {
  return DESIGNATION_LABELS[designation] || designation?.replace(/_/g, ' ') || '—'
}

function DonationGridCard({ item, onView }) {
  const isAnonymous = !item.donorName || item.donorName.toLowerCase() === 'anonymous'

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="border-b border-border/60 bg-gradient-to-br from-pink-500/8 via-transparent to-primary/5 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {isAnonymous ? <Heart className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold leading-snug">{item.donorName || 'Anonymous'}</p>
              {item.donorEmail && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.donorEmail}</p>
              )}
            </div>
          </div>
          <Badge variant={item.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-2xl font-bold tracking-tight text-primary">
          {formatCurrency(item.amount, item.currency)}
        </p>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 capitalize">
            <CreditCard className="h-3.5 w-3.5 shrink-0" />
            {formatType(item.type)}
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-3.5 w-3.5 shrink-0" />
            {formatDesignation(item.designation)}
          </div>
          {item.referenceCode && (
            <p className="font-mono text-[11px] text-primary/80">{item.referenceCode}</p>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
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

function DonationDetailModal({ donation, open, onClose, onStatusChange, saving }) {
  if (!donation) return null

  return (
    <Modal open={open} onClose={onClose} title="Donation details" className="max-w-md">
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/8 to-transparent p-5 text-center">
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(donation.amount, donation.currency)}
          </p>
          <div className="mt-3 flex justify-center">
            <Badge variant={donation.status} />
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
            <dt className="text-muted-foreground">Donor</dt>
            <dd className="text-right font-medium">{donation.donorName || 'Anonymous'}</dd>
          </div>
          {donation.donorEmail && (
            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email
              </dt>
              <dd className="text-right text-xs">{donation.donorEmail}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="capitalize">{formatType(donation.type)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
            <dt className="text-muted-foreground">Designation</dt>
            <dd>{formatDesignation(donation.designation)}</dd>
          </div>
          {donation.referenceCode && (
            <div className="flex justify-between gap-4 border-b border-border/60 pb-3">
              <dt className="text-muted-foreground">Reference</dt>
              <dd className="font-mono text-xs text-primary">{donation.referenceCode}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Received</dt>
            <dd>{formatDateTime(donation.createdAt)}</dd>
          </div>
        </dl>

        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
          <Label htmlFor="donation-status">Update status</Label>
          <Select
            id="donation-status"
            value={donation.status}
            disabled={saving}
            onChange={(e) => onStatusChange(donation.id, e.target.value)}
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

export default function DonationsPage() {
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
      const res = await api.getDonations({ limit: 100 })
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

  const totalCompletedAmount = useMemo(
    () => items.reduce((sum, d) => sum + (d.status === 'completed' ? d.amount : 0), 0),
    [items],
  )

  const filtered = useMemo(
    () => filterContentItems(items, { search, status }),
    [items, search, status],
  )

  const paged = useMemo(() => paginateClient(filtered, page, 12), [filtered, page])

  const handleStatusChange = async (id, newStatus) => {
    setSaving(true)
    setError('')
    try {
      await api.updateDonation(id, { status: newStatus })
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
      <PageHeader
        title="Donations"
        description="Review incoming gifts, track payment status, and manage donor records."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total records" value={counts.total} accent="blue" />
        <MiniStat label="Completed" value={counts.completed} accent="green" />
        <MiniStat label="Pending" value={counts.pending} accent="amber" />
        <MiniStat label="Completed amount" value={formatCurrency(totalCompletedAmount)} accent="purple" />
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
        tabs={DONATION_TABS}
        placeholder="Search donors, emails, references…"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching donations' : 'No donations yet'}
          description={
            items.length
              ? 'Try a different search or filter.'
              : 'Donation records will appear here when donors contribute.'
          }
          icon={Heart}
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paged.data.map((item) => (
              <DonationGridCard key={item.id} item={item} onView={setSelected} />
            ))}
          </div>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Donor</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Designation</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {paged.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.donorName || 'Anonymous'}</p>
                    {item.donorEmail && (
                      <p className="text-xs text-muted-foreground">{item.donorEmail}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {formatCurrency(item.amount, item.currency)}
                  </TableCell>
                  <TableCell className="capitalize">{formatType(item.type)}</TableCell>
                  <TableCell className="text-sm">{formatDesignation(item.designation)}</TableCell>
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

      <DonationDetailModal
        donation={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        saving={saving}
      />
    </div>
  )
}
