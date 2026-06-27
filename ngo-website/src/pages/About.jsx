import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Eye, Target, Users } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapMissionVision, mapSiteSettings } from '@/lib/mappers'
import { missionVision as fallbackMissionVision } from '@/data/site'
import { mediaUrl } from '@/lib/mediaUrl'

export default function About() {
  const { data: pageData } = useApiData(async () => {
    try {
      const res = await api.getSite()
      return res.data
        ? {
            missionVision: mapMissionVision(res.data),
            siteSettings: mapSiteSettings(res.data),
          }
        : {
            missionVision: fallbackMissionVision,
            siteSettings: null,
          }
    } catch {
      return {
        missionVision: fallbackMissionVision,
        siteSettings: null,
      }
    }
  }, [])

  const missionVision = pageData?.missionVision ?? fallbackMissionVision
  const aboutImage = mediaUrl(
    pageData?.siteSettings?.aboutImageUrl || '/uploads/general/gallery-1.jpg',
  )

  usePageMeta('About Us - Vision Mentors Group')

  return (
    <PageLayout>
      <PageHero
        title="About Vision Mentors Group"
        description="Partnering with communities in Kenya to improve learning outcomes, strengthen health, and build resilience through evidence-based, community-centered programs."
      />

      <section className="py-16 md:py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-2 border-primary/10">
              <Target className="text-primary mb-4" size={28} />
              <h2 className="text-xl font-bold text-foreground mb-3">Mission</h2>
              <p className="text-muted-foreground leading-relaxed">{missionVision.mission}</p>
            </Card>
            <Card className="p-8 border-2 border-secondary/10">
              <Eye className="text-secondary mb-4" size={28} />
              <h2 className="text-xl font-bold text-foreground mb-3">Vision</h2>
              <p className="text-muted-foreground leading-relaxed">{missionVision.vision}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Vision Mentors Group works closely with communities and local government partners in Kenya to address barriers to quality education, health, and resilience. We began with a clear commitment: to combine evidence-based programming with deep community engagement.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We recognized that sustainable change requires partnerships, not dependence. Communities possess wisdom and agency. Our role is to listen, collaborate, and support local leadership in building long-term solutions that honor dignity and drive real outcomes.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, we work across multiple counties in Kenya, supported by dedicated partners, volunteers, and donors who believe in evidence-based, community-centered development.
                </p>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={aboutImage}
                  alt="Vision Mentors Group team working together"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground">Guiding every decision and action we take</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Eye, title: 'Transparency', description: 'We openly share how funds are used, impact metrics, and decision-making processes with donors and communities.' },
                { icon: Target, title: 'Accountability', description: 'We measure, verify, and report our impact. Every program is evaluated for effectiveness and community benefit.' },
                { icon: Users, title: 'Human Dignity', description: 'Communities and beneficiaries are never reduced to statistics. We honor agency, culture, and individual worth.' },
                { icon: CheckCircle, title: 'Sustainability', description: 'We build long-term solutions, not band-aids. Our programs empower communities toward independence.' },
              ].map((value) => {
                const Icon = value.icon
                return (
                  <Card key={value.title} className="p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                        <Icon className="text-white" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Leadership Team</h2>
              <p className="text-lg text-muted-foreground">Experienced professionals committed to our mission</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah Chen', title: 'Executive Director', bio: '20+ years in humanitarian work across Africa and Asia. MBA from Harvard Kennedy School.' },
                { name: 'James Okafor', title: 'Programs Director', bio: 'Community development expert with deep roots in East Africa. Led programs serving 100,000+ beneficiaries.' },
                { name: 'Dr. Amara Diop', title: 'Impact & Accountability Officer', bio: 'PhD in Development Economics. Pioneered transparent impact measurement frameworks for NGOs.' },
              ].map((member) => (
                <Card key={member.name} className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{member.title}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Global Reach & Impact</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: '28', label: 'Countries' },
                { number: '45,230', label: 'Families Served' },
                { number: '3,847', label: 'Volunteers' },
                { number: '98%', label: 'Fund Efficiency' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-secondary/10 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Work With Us</h2>
          <p className="text-muted-foreground mb-6">Explore careers, partnerships, volunteering, and procurement opportunities.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild><Link to="/get-involved">Get Involved</Link></Button>
            <Button asChild variant="outline"><Link to="/tenders">View Tenders</Link></Button>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
