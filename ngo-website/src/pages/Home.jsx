import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { SectionHeading } from '@/components/SectionHeading'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import {
  mapProgram,
  mapFallbackProgram,
  mapNewsArticle,
  mapFallbackNewsArticle,
  mapTender,
  mapPartner,
  mapTestimonial,
  mapImpactHighlight,
  mapMissionVision,
  mapSiteSettings,
} from '@/lib/mappers'
import { missionVision as fallbackMissionVision, impactHighlights as fallbackImpactHighlights } from '@/data/site'
import { programs as fallbackPrograms } from '@/data/programs'
import { newsArticles as fallbackNews } from '@/data/news'
import { testimonials as fallbackTestimonials } from '@/data/testimonials'
import { partners as fallbackPartners } from '@/data/partners'
import { tenders as fallbackTenders } from '@/data/tenders'
import { NewsCard } from '@/components/NewsCard'
import { mediaUrl } from '@/lib/mediaUrl'
import {
  Heart,
  Users,
  Zap,
  ArrowRight,
  Target,
  Eye,
  FileText,
  Quote,
} from 'lucide-react'

export default function Home() {
  const [offsetY, setOffsetY] = useState(0)

  const { data: homeData } = useApiData(async () => {
    const [siteRes, programsRes, newsRes, tendersRes, partnersRes, testimonialsRes, impactRes] =
      await Promise.all([
        api.getSite().catch(() => null),
        api.getPrograms().catch(() => null),
        api.getNews({ limit: 3 }).catch(() => null),
        api.getTenders({ status: 'open', limit: 10 }).catch(() => null),
        api.getPartners().catch(() => null),
        api.getTestimonials().catch(() => null),
        api.getImpact().catch(() => null),
      ])

    return {
      missionVision: siteRes?.data ? mapMissionVision(siteRes.data) : fallbackMissionVision,
      siteSettings: siteRes?.data ? mapSiteSettings(siteRes.data) : null,
      programs: programsRes?.data?.length ? programsRes.data.map(mapProgram) : fallbackPrograms.map(mapFallbackProgram),
      newsArticles: newsRes?.data?.length ? newsRes.data.map(mapNewsArticle) : fallbackNews.slice(0, 3).map(mapFallbackNewsArticle),
      openTenders: tendersRes?.data?.length ? tendersRes.data.map(mapTender) : fallbackTenders.filter((t) => t.status === 'open'),
      partners: partnersRes?.data?.length ? partnersRes.data.map(mapPartner) : fallbackPartners,
      testimonials: testimonialsRes?.data?.length ? testimonialsRes.data.map(mapTestimonial) : fallbackTestimonials,
      impactHighlights: impactRes?.data?.highlights?.length
        ? impactRes.data.highlights.map(mapImpactHighlight)
        : fallbackImpactHighlights,
    }
  }, [])

  const missionVision = homeData?.missionVision ?? fallbackMissionVision
  const heroImage = mediaUrl(
    homeData?.siteSettings?.heroImageUrl || '/uploads/general/hero-team.jpg',
  )
  const aboutImage = mediaUrl(
    homeData?.siteSettings?.aboutImageUrl || '/uploads/general/gallery-1.jpg',
  )
  const programs = homeData?.programs ?? fallbackPrograms.map(mapFallbackProgram)
  const newsArticles = homeData?.newsArticles ?? fallbackNews.slice(0, 3).map(mapFallbackNewsArticle)
  const openTenders = homeData?.openTenders ?? fallbackTenders.filter((t) => t.status === 'open')
  const testimonials = homeData?.testimonials ?? fallbackTestimonials
  const partners = homeData?.partners ?? fallbackPartners
  const impactHighlights = homeData?.impactHighlights ?? fallbackImpactHighlights

  usePageMeta('Vision Mentors Group')

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <PageLayout className="bg-gradient-to-b from-background via-white to-background">
      {/* Hero */}
      <section className="relative h-[38rem] md:h-[34rem] flex items-center overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${offsetY * 0.5}px)` }}>
          <img
            src={heroImage}
            alt="Vision Mentors Group team in Kenya"
            className="w-full h-full object-cover object-center"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1C3D]/75 via-[#0A4EDB]/55 to-[#0B1C3D]/80" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <AnimationWrapper animation="slide-up" delay={0}>
            <div className="max-w-3xl">
              <p className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-4">
                Vision Mentors Group · Kenya
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight text-balance">
                Education, Health & Resilience
              </h1>
              <p className="text-lg md:text-xl text-white/95 mb-8 max-w-xl leading-relaxed">
                We partner with communities in Kenya to create lasting change through evidence-based programs that empower families and strengthen local capacity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/donate">Support Our Work</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Link to="/programs">Explore Programs</Link>
                </Button>
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimationWrapper animation="slide-up" delay={0}>
              <Card className="p-8 border-2 border-primary/10 h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="text-primary" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">{missionVision.mission}</p>
              </Card>
            </AnimationWrapper>
            <AnimationWrapper animation="slide-up" delay={100}>
              <Card className="p-8 border-2 border-secondary/10 h-full">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="text-secondary" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">{missionVision.vision}</p>
              </Card>
            </AnimationWrapper>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactHighlights.map((stat, idx) => (
              <AnimationWrapper key={stat.label} animation="scale-in" delay={idx * 100}>
                <Card className="p-6 text-center bg-white">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <p className="text-foreground/70 text-sm">{stat.label}</p>
                </Card>
              </AnimationWrapper>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/impact">View Full Impact Report <ArrowRight size={16} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Our Programs"
            description="Evidence-based initiatives designed with communities to create lasting impact."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, idx) => (
              <AnimationWrapper key={program.id} animation="slide-up" delay={idx * 100}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group">
                  <div className="h-52 overflow-hidden">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                    />
                  </div>
                  <div className="p-6">
                    <program.icon className="text-primary mb-3" size={24} />
                    <h3 className="text-xl font-bold text-foreground mb-2">{program.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{program.description}</p>
                    <Link to="/programs" className="inline-flex items-center text-primary font-semibold text-sm group/link">
                      Learn more <ArrowRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </Card>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Bento */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Our Approach" description="We combine evidence-based programming with deep community partnerships." />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <AnimationWrapper animation="slide-up" delay={100} className="md:col-span-7">
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-transparent border-primary/10 group">
                <div className="h-80 md:h-96 overflow-hidden">
                  <img
                    src={aboutImage}
                    alt="Early Childhood Development"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-3">Community-Centered Design</h3>
                  <p className="text-foreground/70">
                    Programs are co-designed with local leaders, parents, and caregivers. We listen first, then build solutions that communities own and sustain.
                  </p>
                </div>
              </Card>
            </AnimationWrapper>
            <div className="md:col-span-5 flex flex-col gap-6">
              <AnimationWrapper animation="slide-up" delay={150}>
                <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/5 to-transparent border-secondary/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Heart className="text-secondary w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2">Health & Education</h4>
                      <p className="text-sm text-foreground/70">Integrated support for maternal health and early learning.</p>
                    </div>
                  </div>
                </Card>
              </AnimationWrapper>
              <AnimationWrapper animation="slide-up" delay={200}>
                <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-accent/5 to-transparent border-accent/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <Users className="text-accent w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2">Community Resilience</h4>
                      <p className="text-sm text-foreground/70">Building capacity to address climate and economic challenges.</p>
                    </div>
                  </div>
                </Card>
              </AnimationWrapper>
              <AnimationWrapper animation="slide-up" delay={250}>
                <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Zap className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2">Evidence-Based</h4>
                      <p className="text-sm text-foreground/70">Rigorous data guiding design, implementation, and improvement.</p>
                    </div>
                  </div>
                </Card>
              </AnimationWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* Open Tenders Teaser */}
      {openTenders.length > 0 && (
        <section className="py-16 md:py-20 bg-primary/5 border-y border-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Open Procurement Opportunities</h2>
                  <p className="text-muted-foreground">
                    {openTenders.length} active tender{openTenders.length > 1 ? 's' : ''} — transparent, competitive procurement for suppliers and contractors.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/tenders">View All Tenders</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Voices from the Field" description="Hear from communities, parents, and supporters." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <AnimationWrapper key={t.name} animation="slide-up" delay={idx * 100}>
                <Card className="p-8 h-full border-2 border-primary/10 relative">
                  <Quote className="text-primary/20 absolute top-6 right-6" size={32} />
                  <p className="text-muted-foreground italic mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-primary">{t.role}</p>
                </Card>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* News Preview */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Latest News" description="Updates from our programs and communities." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsArticles.slice(0, 3).map((article, idx) => (
              <AnimationWrapper key={article.id} animation="slide-up" delay={idx * 100}>
                <NewsCard article={article} variant="compact" />
              </AnimationWrapper>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link to="/news">All News & Updates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Our Partners" description="Collaborating with government, foundations, and community organizations." />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((partner, idx) => (
              <AnimationWrapper key={partner.name} animation="fade-in" delay={idx * 50}>
                <div className="p-4 rounded-lg border border-border bg-white text-center hover:border-primary/30 transition-colors h-full flex flex-col justify-center">
                  <p className="font-semibold text-foreground text-sm">{partner.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{partner.type}</p>
                </div>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-primary via-primary/90 to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto mb-6" size={48} />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Us in Creating Lasting Change</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Your support helps us reach more children, strengthen health systems, and build resilient communities across Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" variant="secondary">
              <Link to="/donate">Donate Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/get-involved">Get Involved</Link>
            </Button>
          </div>
          <div className="max-w-md mx-auto">
            <p className="text-sm text-white/80 mb-4">Subscribe for impact updates</p>
            <NewsletterSignup variant="footer" />
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
