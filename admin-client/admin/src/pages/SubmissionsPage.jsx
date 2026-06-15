import { useCallback, useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'

const STATUS_OPTIONS = ['new', 'in_progress', 'resolved', 'archived']

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function SubmissionsPage({ title, description, fetchFn, updateFn, getName, renderDetail }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchFn({ page, limit: 20 })
      setItems(res.data)
      setPages(res.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, page])

  useEffect(() => {
    load()
  }, [load])

  const handleStatusChange = async (id, status) => {
    await updateFn(id, status)
    load()
    if (selected?.id === id) setSelected((prev) => ({ ...prev, status }))
  }

  return (
    <div>
      <PageHeader title={title} description={description} />
      {error && <Alert className="mb-4">{error}</Alert>}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState title="No submissions" />
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Received</TableHeader>
                <TableHeader className="text-right">View</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{getName(item)}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="w-36"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelected(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Submission details">
        {selected && (
          <div className="space-y-4">
            {renderDetail(selected)}
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
              <Select
                value={selected.status}
                onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                className="mt-1 w-full"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export function ContactSubmissionsPage() {
  return (
    <SubmissionsPage
      title="Contact submissions"
      description="Messages from the public contact form."
      fetchFn={api.getContacts}
      updateFn={api.updateContactStatus}
      getName={(item) => item.fullName}
      renderDetail={(item) => (
        <>
          <DetailRow label="Name" value={item.fullName} />
          <DetailRow label="Email" value={item.email} />
          <DetailRow label="Phone" value={item.phone} />
          <DetailRow label="Subject" value={item.subject?.replace('_', ' ')} />
          <DetailRow label="Message" value={item.message} />
        </>
      )}
    />
  )
}

export function VolunteerSubmissionsPage() {
  return (
    <SubmissionsPage
      title="Volunteer applications"
      description="Applications from the get-involved page."
      fetchFn={api.getVolunteers}
      updateFn={api.updateVolunteerStatus}
      getName={(item) => item.fullName}
      renderDetail={(item) => (
        <>
          <DetailRow label="Name" value={item.fullName} />
          <DetailRow label="Email" value={item.email} />
          <DetailRow label="Phone" value={item.phone} />
          <DetailRow label="Preferred role" value={item.preferredRole?.replace('_', ' ')} />
          <DetailRow label="Availability" value={item.availability} />
          <DetailRow label="Message" value={item.message} />
        </>
      )}
    />
  )
}

export function PartnershipSubmissionsPage() {
  return (
    <SubmissionsPage
      title="Partnership inquiries"
      description="Partnership requests from organizations."
      fetchFn={api.getPartnerships}
      updateFn={api.updatePartnershipStatus}
      getName={(item) => item.contactName}
      renderDetail={(item) => (
        <>
          <DetailRow label="Organization" value={item.organizationName} />
          <DetailRow label="Contact" value={item.contactName} />
          <DetailRow label="Email" value={item.email} />
          <DetailRow label="Phone" value={item.phone} />
          <DetailRow label="Type" value={item.partnershipType} />
          <DetailRow label="Vision" value={item.vision} />
        </>
      )}
    />
  )
}

export function NewsletterPage() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getNewsletterSubscribers({ page, limit: 20 })
      setItems(res.data)
      setPages(res.pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <PageHeader title="Newsletter subscribers" description="Email subscribers from the website." />
      {error && <Alert className="mb-4">{error}</Alert>}
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState title="No subscribers" />
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
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.email}</TableCell>
                  <TableCell className="capitalize">{item.status}</TableCell>
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
