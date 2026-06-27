import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapTender } from '@/lib/mappers'
import { tenderProcessSteps, tenders as fallbackTenders, tenderFaqs } from '@/data/tenders'
import {
  FileText,
  Download,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Award,
  Mail,
  Shield,
  Scale,
} from 'lucide-react'

const statusConfig = {
  open: {
    label: 'Open',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground border-border',
    icon: Clock,
  },
  awarded: {
    label: 'Awarded',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: Award,
  },
}

function StatusBadge({ status }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Tenders() {
  const [alertEmail, setAlertEmail] = useState('')
  const [alertSubmitted, setAlertSubmitted] = useState(false)
  const [alertError, setAlertError] = useState('')

  const { data: tenders = fallbackTenders } = useApiData(async () => {
    try {
      const res = await api.getTenders({ limit: 50 })
      return res.data?.length ? res.data.map(mapTender) : fallbackTenders
    } catch {
      return fallbackTenders
    }
  }, [])

  usePageMeta('Tenders & Procurement - Vision Mentors Group')

  const openTenders = tenders.filter((t) => t.status === 'open')
  const pastTenders = tenders.filter((t) => t.status !== 'open')

  const handleAlertSubmit = async (e) => {
    e.preventDefault()
    setAlertError('')
    try {
      await api.subscribeTenderAlerts({ email: alertEmail })
      setAlertSubmitted(true)
    } catch (err) {
      setAlertError(err.message || 'Subscription failed')
    }
  }

  return (
    <PageLayout>
      <PageHero
        title="Tenders & Procurement"
        description="Vision Mentors Group conducts fair, transparent procurement for goods, works, and services that support our programs in Kenya."
      />

      <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { icon: Shield, title: 'Transparent Process', desc: 'All open tenders are published publicly with clear criteria and deadlines.' },
                { icon: Scale, title: 'Fair Evaluation', desc: 'Independent procurement committees score bids on merit, compliance, and value.' },
                { icon: FileText, title: 'Accountability', desc: 'Award results are published so donors and partners can verify how funds are used.' },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <AnimationWrapper key={item.title} animation="slide-up" delay={idx * 100}>
                    <Card className="p-6 h-full border-2 border-primary/10 hover:border-primary/20 transition-colors">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                        <Icon className="text-white" size={22} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </Card>
                  </AnimationWrapper>
                )
              })}
            </div>

            <AnimationWrapper animation="fade-in" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How Tenders Work</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our procurement follows a structured process to ensure integrity, competition, and value for money.
                </p>
              </div>
            </AnimationWrapper>

            <div className="max-w-4xl mx-auto space-y-6">
              {tenderProcessSteps.map((item, idx) => (
                <AnimationWrapper key={item.step} animation="slide-up" delay={idx * 80}>
                  <div className="flex gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 pt-1 pb-6 border-b border-border last:border-0">
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </AnimationWrapper>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Open Tenders</h2>
                <p className="text-muted-foreground">
                  {openTenders.length > 0
                    ? `${openTenders.length} active opportunit${openTenders.length === 1 ? 'y' : 'ies'} accepting submissions`
                    : 'No open tenders at this time. Check back soon or subscribe for updates.'}
                </p>
              </div>
              {alertSubmitted ? (
                <p className="text-sm text-primary font-medium">You are subscribed to tender alerts.</p>
              ) : (
                <form onSubmit={handleAlertSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="Email for alerts"
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                  <Button type="submit" variant="outline">
                    <Mail size={16} />
                    Get Tender Alerts
                  </Button>
                </form>
              )}
              {alertError && <p className="text-sm text-destructive mt-2">{alertError}</p>}
            </div>

            {openTenders.length > 0 ? (
              <div className="space-y-6">
                {openTenders.map((tender, idx) => (
                  <AnimationWrapper key={tender.id} animation="slide-up" delay={idx * 100}>
                    <Card className="p-6 md:p-8 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-sm font-mono text-primary font-semibold">{tender.id}</span>
                            <StatusBadge status={tender.status} />
                            <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary font-medium">
                              {tender.category}
                            </span>
                            {tender.contractType && (
                              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                                {tender.contractType}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-foreground">
                            {tender.slug ? (
                              <Link to={`/tenders/${tender.slug}`} className="hover:text-primary transition-colors">
                                {tender.title}
                              </Link>
                            ) : (
                              tender.title
                            )}
                          </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          {tender.slug && (
                            <Button asChild variant="outline">
                              <Link to={`/tenders/${tender.slug}`}>
                                <FileText size={16} />
                                View Full Notice
                              </Link>
                            </Button>
                          )}
                          <Button asChild className="bg-primary hover:bg-primary/90">
                            <a href={`mailto:tenders@visionmentorsgroup.org?subject=Request%20Tender%20Documents%20-%20${encodeURIComponent(tender.id)}`}>
                              <Download size={16} />
                              Request Documents
                            </a>
                          </Button>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-6">{tender.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Published</p>
                          <p className="font-medium text-foreground">{formatDate(tender.published)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 flex items-center gap-1">
                            <AlertCircle size={14} className="text-destructive" />
                            Deadline
                          </p>
                          <p className="font-medium text-foreground">{formatDate(tender.deadline)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 flex items-center gap-1">
                            <MapPin size={14} />
                            Location
                          </p>
                          <p className="font-medium text-foreground">{tender.location}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Estimated Budget</p>
                          <p className="font-medium text-foreground">{tender.budget ?? 'TBC'}</p>
                        </div>
                      </div>
                    </Card>
                  </AnimationWrapper>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
                <p className="text-muted-foreground">There are currently no open tenders. Past awards are listed below.</p>
              </Card>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">Closed & Awarded Tenders</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-sm font-semibold text-foreground">Reference</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-foreground">Title</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-foreground">Category</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-foreground">Deadline</th>
                    <th className="py-3 pr-4 text-sm font-semibold text-foreground">Status</th>
                    <th className="py-3 text-sm font-semibold text-foreground">Awarded To</th>
                  </tr>
                </thead>
                <tbody>
                  {pastTenders.map((tender) => (
                    <tr key={tender.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 pr-4 text-sm font-mono text-primary">{tender.id}</td>
                      <td className="py-4 pr-4 text-sm text-foreground">{tender.title}</td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">{tender.category}</td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">{formatDate(tender.deadline)}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={tender.status} />
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {tender.awardedTo || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Submission Requirements</h2>
                <p className="text-muted-foreground mb-6">
                  While each tender has specific requirements, most submissions must include the following:
                </p>
                <ul className="space-y-3">
                  {[
                    'Completed tender forms as provided in the document pack',
                    'Certificate of incorporation or business registration',
                    'Valid KRA PIN and tax compliance certificate',
                    'Company profile and relevant experience (minimum 3 years)',
                    'Technical proposal addressing all evaluation criteria',
                    'Financial proposal in the prescribed format (sealed if required)',
                    'Bid security or tender bond where specified',
                  ].map((req) => (
                    <li key={req} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Procurement Contact</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  For tender document requests, clarifications, or procurement-related inquiries, contact our Procurement Unit during office hours (Mon–Fri, 9:00 AM – 5:00 PM EAT).
                </p>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:tenders@visionmentorsgroup.org" className="text-primary hover:underline">
                        tenders@visionmentorsgroup.org
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Submission Address</p>
                      <p className="text-muted-foreground">
                        Vision Mentors Group<br />
                        Africa REIT House, Karen<br />
                        2nd Floor, Nairobi, Kenya
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full mt-6">
                  <Link to="/contact">General Inquiries</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {tenderFaqs.map((faq) => (
                <Card key={faq.q} className="p-6 border-l-4 border-l-primary">
                  <h3 className="font-semibold text-foreground mb-3">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
    </PageLayout>
  )
}
