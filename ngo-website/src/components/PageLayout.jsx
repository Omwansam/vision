import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { BackToTop } from '@/components/BackToTop'

export function PageLayout({ children, className = 'bg-white' }) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
