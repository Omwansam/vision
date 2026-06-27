import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/mediaUrl'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapSiteSettings } from '@/lib/mappers'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { pathname } = useLocation()

  const { data: siteSettings } = useApiData(async () => {
    try {
      const res = await api.getSite()
      return res.data ? mapSiteSettings(res.data) : null
    } catch {
      return null
    }
  }, [])

  const logoSrc = mediaUrl(siteSettings?.logoImageUrl || '/uploads/general/vmg-logo.jpg')

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/programs', label: 'Programs' },
    { href: '/impact', label: 'Impact' },
    { href: '/news', label: 'News' },
    { href: '/tenders', label: 'Tenders' },
    { href: '/contact', label: 'Contact' },
  ]

  const linkClass = (href) =>
    cn(
      'px-3 py-2 text-sm font-medium transition-colors relative group',
      pathname === href
        ? 'text-primary'
        : 'text-foreground hover:text-primary',
    )

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-300">
            <img
              src={logoSrc}
              alt="Vision Mentors Group Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => { e.currentTarget.src = '/placeholder-logo.svg' }}
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-0.5">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className={linkClass(link.href)}>
                {link.label}
                <span
                  className={cn(
                    'absolute bottom-1 left-3 right-3 h-0.5 bg-primary transition-all duration-300',
                    pathname === link.href ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100',
                    pathname === link.href && 'scale-x-100',
                  )}
                />
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/gallery">Gallery</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/donate">Support Us</Link>
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'block px-4 py-2.5 rounded-lg transition-colors',
                  pathname === link.href ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted',
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/gallery"
              className="block px-4 py-2.5 rounded-lg text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
            <div className="border-t border-border mt-4 pt-4 px-4 space-y-2">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link to="/donate" onClick={() => setIsOpen(false)}>Support Us</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/get-involved" onClick={() => setIsOpen(false)}>Get Involved</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
