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
  Image,
  Star,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  PenLine,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatDateTime, truncate } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner, StatCard, QuickAction, WelcomeBanner } from '@/components/ui/Common'

function AttentionItem({ to, icon: Icon, title, description, variant = 'default' }) {
  return (
    <Link
      to={to}
      className={`flex items-start gap-3 rounded-xl border p-4 transition-all hover:shadow-sm ${
        variant === 'warning'
          ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
          : 'border-border bg-card hover:border-primary/25'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          variant === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

function ContentPreviewRow({ item, type }) {
  const to = type === 'news' ? `/news/${item.id}/edit` : `/programs/${item.id}/edit`

  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <div className="h-11 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            {type === 'news' ? <Newspaper className="h-4 w-4 text-muted-foreground" /> : <Layers className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {type === 'news' ? truncate(item.excerpt, 50) : truncate(item.description, 50)}
        </p>
      </div>
      <Badge variant={item.status} />
    </Link>
  )
}

export default function Dashboard() {
  const { user, canAccess } = useAuth()
  const [stats, setStats] = useState({})
  const [recent, setRecent] = useState([])
  const [recentNews, setRecentNews] = useState([])
  const [recentPrograms, setRecentPrograms] = useState([])
  const [attention, setAttention] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const next = {}
      const activity = []
      const needsAttention = []

      try {
        if (canAccess('content')) {
          const news = await api.getNews({ limit: 50 })
          next.news = news.total
          next.newsDrafts = news.data.filter((a) => a.status === 'draft').length
          next.newsPublished = news.data.filter((a) => a.status === 'published').length
          next.newsFeatured = news.data.filter((a) => a.isFeatured).length
          setRecentNews(news.data.slice(0, 4))

          if (next.newsDrafts > 0) {
            needsAttention.push({
              to: '/news?status=draft',
              icon: PenLine,
              title: `${next.newsDrafts} draft article${next.newsDrafts > 1 ? 's' : ''}`,
              description: 'Ready to review and publish',
              variant: 'warning',
            })
          }

          news.data.slice(0, 3).forEach((a) =>
            activity.push({
              type: 'news',
              label: a.title,
              status: a.status,
              date: a.updatedAt || a.createdAt,
              to: '/news',
            }),
          )

          const programs = await api.getPrograms()
          next.programs = programs.data?.length || 0
          next.programDrafts = (programs.data || []).filter((p) => p.status === 'draft').length
          setRecentPrograms((programs.data || []).slice(0, 4))

          if (next.programDrafts > 0) {
            needsAttention.push({
              to: '/programs',
              icon: Layers,
              title: `${next.programDrafts} draft program${next.programDrafts > 1 ? 's' : ''}`,
              description: 'Unpublished program pages',
              variant: 'warning',
            })
          }

          const gallery = await api.getGallery({ limit: 1 })
          next.gallery = gallery.data?.length || gallery.total || 0
        }

        if (canAccess('submissions')) {
          const contacts = await api.getContacts({ limit: 1, status: 'new' })
          next.contacts = contacts.total
          if (contacts.total > 0) {
            needsAttention.push({
              to: '/submissions/contact',
              icon: Inbox,
              title: `${contacts.total} new message${contacts.total > 1 ? 's' : ''}`,
              description: 'Contact form submissions awaiting review',
              variant: 'warning',
            })
          }
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
        setAttention(needsAttention.slice(0, 4))
        setStats(next)
        setLoading(false)
      }
    }

    load()
  }, [canAccess])

  const quickActions = [
    canAccess('content') && { to: '/news/new', icon: Plus, label: 'New article', description: 'Publish news' },
    canAccess('content') && { to: '/programs/new', icon: Layers, label: 'Add program', description: 'Create program page' },
    canAccess('content') && { to: '/gallery/new', icon: Image, label: 'Add gallery image', description: 'Upload media' },
    canAccess('submissions') && { to: '/submissions/contact', icon: Inbox, label: 'View messages', description: 'Contact form' },
    canAccess('notifications') && { to: '/notifications', icon: Mail, label: 'Send newsletter', description: 'Email subscribers' },
    canAccess('settings') && { to: '/settings', icon: Settings, label: 'Site settings', description: 'Organization info' },
  ].filter(Boolean)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <WelcomeBanner name={user?.name} role={user?.role} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {canAccess('content') && (
          <>
            <StatCard title="News articles" value={stats.news} icon={Newspaper} to="/news" color="blue" subtitle={`${stats.newsPublished || 0} published`} />
            <StatCard title="Programs" value={stats.programs} icon={Layers} to="/programs" color="green" subtitle={`${stats.programDrafts || 0} drafts`} />
            <StatCard title="Featured articles" value={stats.newsFeatured} icon={Star} to="/news" color="purple" />
            <StatCard title="Gallery images" value={stats.gallery} icon={Image} to="/gallery" color="orange" />
          </>
        )}
        {canAccess('submissions') && (
          <StatCard title="New messages" value={stats.contacts} icon={Inbox} to="/submissions/contact" color="purple" subtitle="Awaiting review" />
        )}
        {canAccess('donations') && (
          <StatCard title="Donations" value={stats.donations} icon={Heart} to="/donations" color="pink" />
        )}
        {canAccess('tenders') && (
          <StatCard title="Tenders" value={stats.tenders} icon={FileText} to="/tenders" color="orange" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {attention.length > 0 && (
          <Card className="lg:col-span-1">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Needs attention
              </CardTitle>
              <CardDescription>Items that may require your action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {attention.map((item) => (
                <AttentionItem key={item.title} {...item} />
              ))}
            </CardContent>
          </Card>
        )}

        {quickActions.length > 0 && (
          <Card className={attention.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base">Quick actions</CardTitle>
              <CardDescription>Common tasks to manage the site</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quickActions.map((action) => (
                  <QuickAction key={action.to} {...action} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {canAccess('content') && (recentNews.length > 0 || recentPrograms.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {recentNews.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <CardTitle className="text-base">Latest news</CardTitle>
                  <CardDescription>Recently updated articles</CardDescription>
                </div>
                <Link to="/news">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-1 pt-3">
                {recentNews.map((item) => (
                  <ContentPreviewRow key={item.id} item={item} type="news" />
                ))}
              </CardContent>
            </Card>
          )}

          {recentPrograms.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <CardTitle className="text-base">Programs</CardTitle>
                  <CardDescription>Your active program pages</CardDescription>
                </div>
                <Link to="/programs">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-1 pt-3">
                {recentPrograms.map((item) => (
                  <ContentPreviewRow key={item.id} item={item} type="program" />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border/60">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent activity
            </CardTitle>
            <CardDescription>Latest updates across the admin portal</CardDescription>
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

      {canAccess('content') && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Keep your content fresh</p>
                <p className="text-sm text-muted-foreground">
                  {stats.newsDrafts
                    ? `You have ${stats.newsDrafts} draft article${stats.newsDrafts > 1 ? 's' : ''} waiting to be published.`
                    : 'Publish news and update programs to keep visitors engaged.'}
                </p>
              </div>
            </div>
            <Link to="/news/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create content
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
