import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, User, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { countByRole, filterUsers, formatDateTime, paginateClient } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui/Common'
import { ContentToolbar, MiniStat } from '@/components/content/ContentToolbar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Pagination } from '@/components/ui/Table'

const USER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'admin', label: 'Admins' },
  { id: 'editor', label: 'Editors' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'finance', label: 'Finance' },
]

const ROLE_LABELS = {
  admin: 'Administrator',
  editor: 'Editor',
  procurement: 'Procurement',
  finance: 'Finance',
}

function UserInitials({ name }) {
  const initials = (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {initials}
    </div>
  )
}

function UserGridCard({ item, onDelete }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
      <div className="border-b border-border/60 bg-gradient-to-br from-purple-500/10 via-transparent to-primary/5 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserInitials name={item.name} />
            <div className="min-w-0">
              <p className="truncate font-semibold leading-snug">{item.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.email}</p>
            </div>
          </div>
          <Badge variant={item.role} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted-foreground">{ROLE_LABELS[item.role] || item.role}</p>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Last login {formatDateTime(item.lastLogin)}
        </p>
        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Link to={`/users/${item.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Delete user">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function UsersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getUsers()
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
  }, [search, role])

  const counts = useMemo(() => countByRole(items), [items])

  const filtered = useMemo(
    () => filterUsers(items, { search, role }),
    [items, search, role],
  )

  const paged = useMemo(() => paginateClient(filtered, page, 12), [filtered, page])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try {
      await api.deleteUser(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage staff accounts, roles, and access to admin sections."
        actions={
          <Link to="/users/new">
            <Button>
              <Plus className="h-4 w-4" />
              New user
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Total users" value={counts.total} accent="blue" />
        <MiniStat label="Administrators" value={counts.admin} accent="purple" />
        <MiniStat label="Editors" value={counts.editor} accent="green" />
        <MiniStat
          label="Specialized roles"
          value={(counts.procurement || 0) + (counts.finance || 0)}
          accent="amber"
        />
      </div>

      {error && <Alert className="mb-4">{error}</Alert>}

      <ContentToolbar
        search={search}
        onSearchChange={setSearch}
        status={role}
        onStatusChange={setRole}
        view={view}
        onViewChange={setView}
        counts={counts}
        tabs={USER_TABS}
        placeholder="Search name or email…"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length ? 'No matching users' : 'No users yet'}
          description={
            items.length
              ? 'Try a different search or role filter.'
              : 'Create a staff account to get started.'
          }
          icon={User}
          action={
            !items.length && (
              <Link to="/users/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create user
                </Button>
              </Link>
            )
          }
        />
      ) : view === 'grid' ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paged.data.map((item) => (
              <UserGridCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
          <Pagination page={paged.page} pages={paged.pages} onPageChange={setPage} />
        </>
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>User</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Last login</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {paged.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserInitials name={item.name} />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.role} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(item.lastLogin)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/users/${item.id}/edit`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
