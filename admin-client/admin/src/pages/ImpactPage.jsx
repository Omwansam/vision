import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, TrendingUp, BarChart3, Target, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import { filterImpactItems } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, EmptyState, LoadingSpinner, PageHeader, SearchInput } from '@/components/ui/Common'
import { MiniStat } from '@/components/content/ContentToolbar'
import { Tabs } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, Select, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

function HighlightCard({ item, onEdit, onDelete }) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(item.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight text-primary">{item.value}</p>
        <p className="mt-2 text-sm font-medium leading-snug text-foreground">{item.label}</p>
        <div className="mt-4 flex items-center gap-2">
          {item.year && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.year}</span>
          )}
          <Badge variant={item.isActive !== false ? 'published' : 'archived'}>
            {item.isActive !== false ? 'Active' : 'Hidden'}
          </Badge>
        </div>
      </div>
    </article>
  )
}

function OutcomeCard({ item, onEdit, onDelete }) {
  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="border-b border-border/60 bg-muted/30 px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">{item.program}</p>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(item.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-2xl font-bold text-primary">{item.metric}</p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
          {item.year && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.year}</span>
          )}
          <Badge variant={item.isActive !== false ? 'published' : 'archived'}>
            {item.isActive !== false ? 'Active' : 'Hidden'}
          </Badge>
        </div>
      </div>
    </article>
  )
}

function ImpactPreview({ tab, form }) {
  if (tab === 'highlights') {
    return (
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-secondary/5 p-6 text-center">
        <p className="text-4xl font-bold text-primary">{form.value || '0'}</p>
        <p className="mt-2 text-sm font-medium">{form.label || 'Highlight label'}</p>
        {form.year && <p className="mt-2 text-xs text-muted-foreground">{form.year}</p>}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{form.program || 'Program'}</p>
      <p className="mt-2 text-2xl font-bold text-primary">{form.metric || '0%'}</p>
      <p className="mt-2 text-sm text-muted-foreground">{form.detail || 'Outcome detail…'}</p>
    </div>
  )
}

export default function ImpactPage() {
  const [highlights, setHighlights] = useState([])
  const [outcomes, setOutcomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('highlights')
  const [search, setSearch] = useState('')
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

  const stats = useMemo(
    () => ({
      highlights: highlights.length,
      highlightsActive: highlights.filter((h) => h.isActive !== false).length,
      outcomes: outcomes.length,
      outcomesActive: outcomes.filter((o) => o.isActive !== false).length,
    }),
    [highlights, outcomes],
  )

  const filteredHighlights = useMemo(() => filterImpactItems(highlights, search), [highlights, search])
  const filteredOutcomes = useMemo(() => filterImpactItems(outcomes, search), [outcomes, search])

  const openHighlightForm = (item = null) => {
    setForm(
      item || {
        value: '',
        label: '',
        year: new Date().getFullYear(),
        isActive: true,
      },
    )
    setModal('highlight')
  }

  const openOutcomeForm = (item = null) => {
    setForm(
      item || {
        program: '',
        metric: '',
        detail: '',
        year: new Date().getFullYear(),
        isActive: true,
      },
    )
    setModal('outcome')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
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

  const tabs = [
    { id: 'highlights', label: `Highlights (${stats.highlights})` },
    { id: 'outcomes', label: `Program outcomes (${stats.outcomes})` },
    { id: 'overview', label: 'Overview' },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Impact"
        description="Manage impact statistics and program outcomes shown on the public impact page."
        actions={
          <Button
            onClick={() => (tab === 'outcomes' ? openOutcomeForm() : openHighlightForm())}
          >
            <Plus className="h-4 w-4" />
            {tab === 'outcomes' ? 'Add outcome' : 'Add highlight'}
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Impact highlights" value={stats.highlights} accent="blue" />
        <MiniStat label="Active highlights" value={stats.highlightsActive} accent="green" />
        <MiniStat label="Program outcomes" value={stats.outcomes} accent="purple" />
        <MiniStat label="Active outcomes" value={stats.outcomesActive} accent="amber" />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

      {tab !== 'overview' && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'highlights' ? 'Search highlights…' : 'Search outcomes…'}
            className="w-full sm:max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={() => (tab === 'outcomes' ? openOutcomeForm() : openHighlightForm())}>
            <Plus className="h-4 w-4" />
            Add {tab === 'outcomes' ? 'outcome' : 'highlight'}
          </Button>
        </div>
      )}

      {tab === 'highlights' && (
        filteredHighlights.length === 0 ? (
          <EmptyState
            title={highlights.length ? 'No matching highlights' : 'No highlights yet'}
            description="Add key impact numbers displayed on the public website."
            icon={TrendingUp}
            action={
              !highlights.length && (
                <Button onClick={() => openHighlightForm()}>
                  <Plus className="h-4 w-4" />
                  Add highlight
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredHighlights.map((item) => (
              <HighlightCard key={item.id} item={item} onEdit={openHighlightForm} onDelete={handleDeleteHighlight} />
            ))}
          </div>
        )
      )}

      {tab === 'outcomes' && (
        filteredOutcomes.length === 0 ? (
          <EmptyState
            title={outcomes.length ? 'No matching outcomes' : 'No outcomes yet'}
            description="Add measurable results for each program area."
            icon={BarChart3}
            action={
              !outcomes.length && (
                <Button onClick={() => openOutcomeForm()}>
                  <Plus className="h-4 w-4" />
                  Add outcome
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredOutcomes.map((item) => (
              <OutcomeCard key={item.id} item={item} onEdit={openOutcomeForm} onDelete={handleDeleteOutcome} />
            ))}
          </div>
        )
      )}

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Impact highlights
              </CardTitle>
              <CardDescription>Key numbers on the impact page hero</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
              {highlights.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-xl font-bold text-primary">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
              {highlights.length === 0 && (
                <p className="col-span-2 text-sm text-muted-foreground">No highlights configured.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/60">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Program outcomes
              </CardTitle>
              <CardDescription>Results linked to specific programs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {outcomes.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold">{item.program}</p>
                  <p className="text-lg font-bold text-primary">{item.metric}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
              {outcomes.length === 0 && (
                <p className="text-sm text-muted-foreground">No outcomes configured.</p>
              )}
            </CardContent>
          </Card>

          <Card className={cn('border-dashed bg-muted/20 lg:col-span-2')}>
            <CardContent className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
              <div>
                <p className="font-semibold">Public impact page preview</p>
                <p className="text-sm text-muted-foreground">
                  {stats.highlightsActive} highlights and {stats.outcomesActive} outcomes are visible on the website.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTab('highlights')}>Manage highlights</Button>
                <Button variant="outline" onClick={() => setTab('outcomes')}>Manage outcomes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal === 'highlight' ? (form.id ? 'Edit highlight' : 'Add highlight') : form.id ? 'Edit outcome' : 'Add outcome'}
        className="max-w-lg"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {modal === 'highlight' ? (
              <>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    required
                    value={form.value || ''}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="12,500+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Textarea
                    required
                    rows={2}
                    value={form.label || ''}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Children supported through ECD programs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={form.year || ''}
                      onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select
                      value={form.isActive !== false ? 'active' : 'hidden'}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                    >
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Input
                    required
                    value={form.program || ''}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    placeholder="Early Childhood Development"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metric</Label>
                  <Input
                    required
                    value={form.metric || ''}
                    onChange={(e) => setForm({ ...form, metric: e.target.value })}
                    placeholder="65%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Detail</Label>
                  <Textarea
                    required
                    rows={3}
                    value={form.detail || ''}
                    onChange={(e) => setForm({ ...form, detail: e.target.value })}
                    placeholder="improvement in school readiness scores"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={form.year || ''}
                      onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select
                      value={form.isActive !== false ? 'active' : 'hidden'}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                    >
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                    </Select>
                  </div>
                </div>
              </>
            )}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </form>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
            <ImpactPreview tab={modal === 'highlight' ? 'highlights' : 'outcomes'} form={form} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
