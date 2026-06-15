import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

export default function ImpactPage() {
  const [highlights, setHighlights] = useState([])
  const [outcomes, setOutcomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getImpact()
      setHighlights(res.data?.highlights || [])
      setOutcomes(res.data?.outcomes || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openHighlightForm = (item = null) => {
    setForm(item || { value: '', label: '', year: new Date().getFullYear() })
    setModal('highlight')
  }

  const openOutcomeForm = (item = null) => {
    setForm(item || { program: '', metric: '', detail: '', year: new Date().getFullYear() })
    setModal('outcome')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (modal === 'highlight') await api.upsertImpactHighlight(form)
      else await api.upsertProgramOutcome(form)
      setModal(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteHighlight = async (id) => {
    if (!window.confirm('Delete this highlight?')) return
    await api.deleteImpactHighlight(id)
    load()
  }

  const handleDeleteOutcome = async (id) => {
    if (!window.confirm('Delete this outcome?')) return
    await api.deleteProgramOutcome(id)
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Impact" description="Manage impact highlights and program outcomes." />
      {error && <Alert className="mb-4">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Highlights</CardTitle>
            <Button size="sm" onClick={() => openHighlightForm()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {highlights.length === 0 ? (
              <EmptyState title="No highlights" />
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Label</TableHeader>
                    <TableHeader>Value</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {highlights.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell className="font-medium">{item.value}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openHighlightForm(item)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteHighlight(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Program outcomes</CardTitle>
            <Button size="sm" onClick={() => openOutcomeForm()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {outcomes.length === 0 ? (
              <EmptyState title="No outcomes" />
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeader>Program</TableHeader>
                    <TableHeader>Metric</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </tr>
                </TableHead>
                <TableBody>
                  {outcomes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.program}</TableCell>
                      <TableCell>{item.metric}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openOutcomeForm(item)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteOutcome(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === 'highlight' ? (form.id ? 'Edit highlight' : 'Add highlight') : form.id ? 'Edit outcome' : 'Add outcome'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modal === 'highlight' ? (
            <>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input required value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input required value={form.value || ''} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={form.year || ''} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) })} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Program</Label>
                <Input required value={form.program || ''} onChange={(e) => setForm({ ...form, program: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Metric</Label>
                <Input required value={form.metric || ''} onChange={(e) => setForm({ ...form, metric: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Detail</Label>
                <Input required value={form.detail || ''} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
              </div>
            </>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
