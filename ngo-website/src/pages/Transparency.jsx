import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { SectionHeading } from '@/components/SectionHeading'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapFundAllocation, mapTransparencyDocument } from '@/lib/mappers'
import { Download, FileText, PieChart, Shield } from 'lucide-react'

const fallbackAllocation = [
  { category: 'Program Delivery', percentage: 82 },
  { category: 'Monitoring & Evaluation', percentage: 8 },
  { category: 'Administration', percentage: 6 },
  { category: 'Fundraising', percentage: 4 },
]

const fallbackDocuments = [
  { title: '2024 Annual Impact Report', type: 'Impact', year: '2024' },
  { title: '2024 Audited Financial Statements', type: 'Financial', year: '2024' },
  { title: 'Procurement Policy & Guidelines', type: 'Governance', year: '2025' },
]

export default function Transparency() {
  const { data } = useApiData(async () => {
    try {
      const res = await api.getTransparency()
      return {
        year: res.data?.year || new Date().getFullYear(),
        fundAllocation: res.data?.fundAllocation?.length
          ? res.data.fundAllocation.map(mapFundAllocation)
          : fallbackAllocation,
        documents: res.data?.documents?.length
          ? res.data.documents.map(mapTransparencyDocument)
          : fallbackDocuments,
      }
    } catch {
      return {
        year: new Date().getFullYear(),
        fundAllocation: fallbackAllocation,
        documents: fallbackDocuments,
      }
    }
  }, [])

  const fundAllocation = data?.fundAllocation ?? fallbackAllocation
  const documents = data?.documents ?? fallbackDocuments
  const year = data?.year ?? new Date().getFullYear()

  usePageMeta(
    'Transparency Report - Vision Mentors Group',
    'Financial stewardship, governance policies, and published reports from Vision Mentors Group.',
  )

  return (
    <PageLayout>
      <PageHero
        title="Transparency & Accountability"
        description="We believe trust is earned through openness. Explore how we allocate funds, govern our work, and report on impact."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Shield, title: 'Independent Audits', desc: 'Annual financial audits conducted by certified auditors.' },
              { icon: PieChart, title: '98% Program Spend', desc: 'The vast majority of funds go directly to field programs.' },
              { icon: FileText, title: 'Public Procurement', desc: 'All tenders published openly with award results disclosed.' },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <AnimationWrapper key={item.title} animation="slide-up" delay={idx * 100}>
                  <Card className="p-6 text-center h-full">
                    <Icon className="mx-auto text-primary mb-4" size={32} />
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </Card>
                </AnimationWrapper>
              )
            })}
          </div>

          <SectionHeading title={`How Funds Are Allocated (${year})`} centered />
          <div className="max-w-2xl mx-auto space-y-4">
            {fundAllocation.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-foreground">{item.category}</span>
                  <span className="font-bold text-primary">{item.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Published Documents" description="Download or request copies of our governance and impact publications." />
          <div className="space-y-4">
            {documents.map((doc, idx) => (
              <AnimationWrapper key={doc.id || doc.title} animation="slide-up" delay={idx * 50}>
                <Card className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">{doc.type} · {doc.year}</p>
                    <h3 className="font-semibold text-foreground">{doc.title}</h3>
                  </div>
                  {doc.fileUrl ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download size={16} />
                        Download
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:info@visionmentorsgroup.org?subject=Request%3A%20${encodeURIComponent(doc.title)}`}>
                        <Download size={16} />
                        Request PDF
                      </a>
                    </Button>
                  )}
                </Card>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Our Finances?</h2>
          <p className="text-muted-foreground mb-6">Contact our Accountability Officer or review open procurement opportunities.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild><Link to="/contact">Contact Us</Link></Button>
            <Button asChild variant="outline"><Link to="/tenders">View Tenders</Link></Button>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
