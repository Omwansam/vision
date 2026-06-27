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
import { mapProgram, mapFallbackProgram, mapImpactHighlight, mapProgramOutcome } from '@/lib/mappers'
import { impactHighlights as fallbackHighlights } from '@/data/site'
import { programs as fallbackPrograms } from '@/data/programs'
import { BarChart3, Download, TrendingUp } from 'lucide-react'

const fallbackOutcomes = [
  { program: 'Early Childhood Development', metric: '65%', detail: 'improvement in school readiness scores' },
  { program: 'Maternal Health Initiative', metric: '38%', detail: 'reduction in reported maternal complications' },
  { program: 'Community Resilience', metric: '12,500', detail: 'community members supported with livelihood programs' },
]

export default function Impact() {
  const { data } = useApiData(async () => {
    const [impactRes, programsRes] = await Promise.all([
      api.getImpact().catch(() => null),
      api.getPrograms().catch(() => null),
    ])

    return {
      highlights: impactRes?.data?.highlights?.length
        ? impactRes.data.highlights.map(mapImpactHighlight)
        : fallbackHighlights,
      outcomes: impactRes?.data?.outcomes?.length
        ? impactRes.data.outcomes.map(mapProgramOutcome)
        : fallbackOutcomes,
      programs: programsRes?.data?.length
        ? programsRes.data.map(mapProgram)
        : fallbackPrograms.map(mapFallbackProgram),
    }
  }, [])

  const impactHighlights = data?.highlights ?? fallbackHighlights
  const yearlyOutcomes = data?.outcomes ?? fallbackOutcomes
  const programs = data?.programs ?? fallbackPrograms.map(mapFallbackProgram)

  usePageMeta(
    'Our Impact - Vision Mentors Group',
    'Measurable outcomes from our education, health, and resilience programs across Kenya.',
  )

  return (
    <PageLayout>
      <PageHero
        title="Our Impact"
        description="Evidence-based programs delivering measurable change for children, mothers, and communities across Kenya."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactHighlights.map((item, idx) => (
              <AnimationWrapper key={item.label} animation="scale-in" delay={idx * 100}>
                <Card className="p-6 text-center border-2 border-primary/10">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-2">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </Card>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Program Outcomes" description="Key results from our most recent evaluation cycle, verified by independent assessors." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {yearlyOutcomes.map((outcome, idx) => (
              <AnimationWrapper key={outcome.program} animation="slide-up" delay={idx * 100}>
                <Card className="p-8 h-full">
                  <TrendingUp className="text-primary mb-4" size={28} />
                  <p className="text-3xl font-bold text-primary mb-2">{outcome.metric}</p>
                  <h3 className="font-semibold text-foreground mb-2">{outcome.program}</h3>
                  <p className="text-sm text-muted-foreground">{outcome.detail}</p>
                </Card>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Impact by Program" description="Explore how each initiative contributes to community transformation." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((program, idx) => (
              <AnimationWrapper key={program.id} animation="slide-up" delay={idx * 100}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img src={program.image} alt={program.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg' }} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{program.title}</h3>
                    <ul className="space-y-2 mb-4">
                      {program.stats.map((stat) => (
                        <li key={stat} className="text-sm text-muted-foreground flex items-center gap-2">
                          <BarChart3 size={14} className="text-primary shrink-0" />
                          {stat}
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/programs">View Program</Link>
                    </Button>
                  </div>
                </Card>
              </AnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading title="Transparency Reports" description="Access our published impact and financial transparency documents." />
          <Button asChild variant="outline">
            <Link to="/transparency"><Download size={16} />View Transparency Portal</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  )
}
