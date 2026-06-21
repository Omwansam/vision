import { useCallback, useEffect, useState } from 'react'
import { Heart, CheckCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Alert, EmptyState, LoadingSpinner, PageHeader, StatCard } from '@/components/ui/Common'
import { Select } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']

export default function DonationsPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getDonations({ page, limit: 20 })
      setItems(res.data)
      setPages(res.pages)
      setTotal(res.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id, status) => {
    await api.updateDonation(id, { status })
    load()
  }

  const completed = items.filter((d) => d.status === 'completed').length
  const pending = items.filter((d) => d.status === 'pending').length
  const totalAmount = items.reduce((sum, d) => sum + (d.status === 'completed' ? d.amount : 0), 0)

  return (
    <div>
      <PageHeader title="Donations" description="Review donation records and payment status." />

      {!loading && items.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard title="Total records" value={total} icon={Heart} color="pink" />
          <StatCard title="Completed (page)" value={completed} icon={CheckCircle} color="green" subtitle={`${pending} pending on this page`} />
          <StatCard title="Completed amount (page)" value={formatCurrency(totalAmount)} icon={Clock} color="blue" />
        </div>
      )}

      {error && <Alert className="mb-4">{error}</Alert>}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState title="No donations" description="Donation records will appear here." />
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Donor</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.donorName || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{item.donorEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(item.amount, item.currency)}</TableCell>
                  <TableCell className="capitalize">{item.type?.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <Select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="w-36"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
