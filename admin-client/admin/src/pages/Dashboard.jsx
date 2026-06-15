import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, Inbox, Heart, FileText, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Common'

function StatCard({ title, value, icon: Icon, to }) {
  const content = (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value ?? '—'}</p>
      </CardContent>
    </Card>
  )

  return to ? <Link to={to}>{content}</Link> : content
}

export default function Dashboard() {
  const { user, canAccess } = useAuth()
  const [stats, setStats] = useState({})
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const next = {}
      const activity = []

      try {
        if (canAccess('content')) {
          const news = await api.getNews({ limit: 5 })
          next.news = news.total
          news.data.forEach((a) =>
            activity.push({ type: 'news', label: a.title, status: a.status, date: a.updatedAt || a.createdAt, to: '/news' }),
          )
        }
        if (canAccess('submissions')) {
          const contacts = await api.getContacts({ limit: 1, status: 'new' })
          next.contacts = contacts.total
          const recentContacts = await api.getContacts({ limit: 3 })
          recentContacts.data.forEach((c) =>
            activity.push({ type: 'contact', label: c.fullName, status: c.status, date: c.createdAt, to: '/submissions/contact' }),
          )
        }
        if (canAccess('donations')) {
          const donations = await api.getDonations({ limit: 1 })
          next.donations = donations.total
        }
        if (canAccess('tenders')) {
          const tenders = await api.getTenders({ limit: 1 })
          next.tenders = tenders.total
        }
      } catch {
        // optional
      } finally {
        activity.sort((a, b) => new Date(b.date) - new Date(a.date))
        setRecent(activity.slice(0, 6))
        setStats(next)
        setLoading(false)
      }
    }

    load()
  }, [canAccess])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage content, submissions, and operations for Vision Mentors Group.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canAccess('content') && (
          <StatCard title="News articles" value={stats.news} icon={Newspaper} to="/news" />
        )}
        {canAccess('submissions') && (
          <StatCard title="New contact messages" value={stats.contacts} icon={Inbox} to="/submissions/contact" />
        )}
        {canAccess('donations') && (
          <StatCard title="Donations" value={stats.donations} icon={Heart} to="/donations" />
        )}
        {canAccess('tenders') && (
          <StatCard title="Tenders" value={stats.tenders} icon={FileText} to="/tenders" />
        )}
      </div>

      {recent.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {recent.map((item, i) => (
                <li key={`${item.type}-${i}`}>
                  <Link to={item.to} className="flex items-center justify-between gap-4 py-3 hover:bg-muted/30 -mx-2 px-2 rounded-md">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs capitalize text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <Badge variant={item.status} />
                      <span className="text-xs text-muted-foreground">{formatDateTime(item.date)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
