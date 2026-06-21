import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Newspaper,
  Inbox,
  Heart,
  FileText,
  Clock,
  Plus,
  Mail,
  Layers,
  Settings,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner, StatCard, QuickAction, WelcomeBanner } from '@/components/ui/Common'

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
            activity.push({
              type: 'news',
              label: a.title,
              status: a.status,
              date: a.updatedAt || a.createdAt,
              to: '/news',
            }),
          )
        }
        if (canAccess('submissions')) {
          const contacts = await api.getContacts({ limit: 1, status: 'new' })
          next.contacts = contacts.total
          const recentContacts = await api.getContacts({ limit: 3 })
          recentContacts.data.forEach((c) =>
            activity.push({
              type: 'contact',
              label: c.fullName,
              status: c.status,
              date: c.createdAt,
              to: '/submissions/contact',
            }),
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

  const quickActions = [
    canAccess('content') && { to: '/news/new', icon: Plus, label: 'New article', description: 'Publish news' },
    canAccess('content') && { to: '/programs/new', icon: Layers, label: 'Add program', description: 'Create program page' },
    canAccess('submissions') && { to: '/submissions/contact', icon: Inbox, label: 'View messages', description: 'Contact form' },
    canAccess('notifications') && { to: '/notifications', icon: Mail, label: 'Send newsletter', description: 'Email subscribers' },
    canAccess('settings') && { to: '/settings', icon: Settings, label: 'Site settings', description: 'Organization info' },
  ].filter(Boolean)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <WelcomeBanner name={user?.name} role={user?.role} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canAccess('content') && (
          <StatCard title="News articles" value={stats.news} icon={Newspaper} to="/news" color="blue" />
        )}
        {canAccess('submissions') && (
          <StatCard
            title="New messages"
            value={stats.contacts}
            icon={Inbox}
            to="/submissions/contact"
            color="purple"
            subtitle="Awaiting review"
          />
        )}
        {canAccess('donations') && (
          <StatCard title="Donations" value={stats.donations} icon={Heart} to="/donations" color="pink" />
        )}
        {canAccess('tenders') && (
          <StatCard title="Tenders" value={stats.tenders} icon={FileText} to="/tenders" color="orange" />
        )}
      </div>

      {quickActions.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((action) => (
              <QuickAction key={action.to} {...action} />
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recent.map((item, i) => (
                <li key={`${item.type}-${i}`}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.label}</p>
                      <p className="text-xs capitalize text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-right">
                      <Badge variant={item.status} />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {formatDateTime(item.date)}
                      </span>
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
