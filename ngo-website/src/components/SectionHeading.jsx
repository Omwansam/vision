import { AnimationWrapper } from '@/components/AnimationWrapper'

export function SectionHeading({ title, description, centered = true, className = '' }) {
  return (
    <AnimationWrapper animation="fade-in" delay={0}>
      <div className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
        {description && (
          <p className={`text-lg text-muted-foreground ${centered ? 'max-w-2xl mx-auto' : 'max-w-3xl'}`}>
            {description}
          </p>
        )}
      </div>
    </AnimationWrapper>
  )
}
