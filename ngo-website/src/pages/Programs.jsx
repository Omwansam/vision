import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapProgram, mapFallbackProgram } from '@/lib/mappers'
import { programs as fallbackPrograms } from '@/data/programs'

function ProgramImageCarousel({ program }) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const images = program.images || [program.image]

  const goToPrevious = () => {
    setCurrentImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative h-80 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500 group">
      <img
        src={images[currentImageIdx] || '/placeholder.svg'}
        alt={program.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg'
        }}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImageIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIdx ? 'bg-white w-6' : 'bg-white/50 w-2'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Programs() {
  usePageMeta('Our Programs - Vision Mentors Group')

  const { data: programs = fallbackPrograms.map(mapFallbackProgram) } = useApiData(async () => {
    try {
      const res = await api.getPrograms()
      return res.data?.length ? res.data.map(mapProgram) : fallbackPrograms.map(mapFallbackProgram)
    } catch {
      return fallbackPrograms.map(mapFallbackProgram)
    }
  }, [])

  return (
    <PageLayout className="bg-gradient-to-b from-background via-white to-background">
      <PageHero
        title="Our Programs"
        description="Evidence-based initiatives designed with communities to create lasting impact in education, health, and resilience."
      />

      <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            {programs.map((program, idx) => (
              <AnimationWrapper key={program.id} animation="slide-up" delay={idx * 100}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                    <ProgramImageCarousel program={program} />
                  </div>

                  <div className={idx % 2 === 1 ? 'md:order-1' : ''}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <program.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-primary">Program</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{program.title}</h2>
                    <p className="text-foreground/70 mb-6 leading-relaxed text-lg">{program.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-t border-b border-border">
                      {program.stats.map((stat) => (
                        <div key={stat}>
                          <p className="text-sm text-foreground/60 mb-1">{stat.split(' ').slice(-1)[0]}</p>
                          <p className="font-bold text-foreground">{stat.split(' ').slice(0, -2).join(' ')}</p>
                        </div>
                      ))}
                    </div>

                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <Link to="/donate">Support This Program</Link>
                    </Button>
                  </div>
                </div>
              </AnimationWrapper>
            ))}
          </div>
        </section>

        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-primary/5 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimationWrapper animation="fade-in" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Operating in Kenya</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                  <Users className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-bold text-foreground mb-2">2 Counties</h3>
                  <p className="text-foreground/70 text-sm">Strategic focus areas for maximum impact and community engagement</p>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-secondary/5 to-transparent border-secondary/10">
                  <BookOpen className="w-8 h-8 text-secondary mb-3" />
                  <h3 className="font-bold text-foreground mb-2">45+ Communities</h3>
                  <p className="text-foreground/70 text-sm">Sustained partnerships creating local ownership and sustainability</p>
                </Card>
              </div>
            </AnimationWrapper>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimationWrapper animation="slide-up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Make a Difference</h2>
              <p className="text-lg text-foreground/70 mb-8">
                Your support directly funds programs that transform lives and strengthen communities.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/donate">Support Our Programs</Link>
              </Button>
            </AnimationWrapper>
          </div>
        </section>
    </PageLayout>
  )
}
