import { useEffect, useRef, useState } from 'react'

const animationClasses = {
  'fade-in': 'animate-fade-in',
  'slide-up': 'animate-slide-up',
  'slide-down': 'animate-slide-down',
  'slide-left': 'animate-slide-left',
  'slide-right': 'animate-slide-right',
  'scale-in': 'animate-scale-in',
}

export function AnimationWrapper({
  children,
  animation,
  delay = 0,
  duration = '0.6s',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`${isVisible ? animationClasses[animation] : 'opacity-0'} ${className}`}
      style={{
        animationDuration: duration,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
