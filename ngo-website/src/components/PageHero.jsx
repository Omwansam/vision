import { AnimationWrapper } from '@/components/AnimationWrapper'

export function PageHero({ title, description, children }) {
  return (
    <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimationWrapper animation="fade-in" delay={0}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
          )}
          {children}
        </AnimationWrapper>
      </div>
    </section>
  )
}
