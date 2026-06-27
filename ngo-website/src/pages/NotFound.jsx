import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('Page Not Found - Vision Mentors Group')

  return (
    <PageLayout>
      <section className="py-24 md:py-32 text-center">
        <div className="max-w-lg mx-auto px-4">
          <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
          <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/">
                <Home size={16} />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft size={16} />
              Go Back
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
