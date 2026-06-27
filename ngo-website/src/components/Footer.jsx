import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapSiteSettings } from '@/lib/mappers'
import { site as fallbackSite } from '@/data/site'

export function Footer() {
  const { data } = useApiData(async () => {
    try {
      const res = await api.getSite()
      return res.data ? mapSiteSettings(res.data) : fallbackSite
    } catch {
      return fallbackSite
    }
  }, [])
  const site = data ?? fallbackSite
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-lg mb-3">{site.name}</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {site.description}
            </p>
            <div>
              <p className="text-sm font-medium mb-3">Stay updated</p>
              <NewsletterSignup variant="footer" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/programs" className="hover:text-white transition-colors">Programs</Link></li>
              <li><Link to="/impact" className="hover:text-white transition-colors">Impact</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">News</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              <li><Link to="/tenders" className="hover:text-white transition-colors">Tenders</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Get Involved</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/donate" className="hover:text-white transition-colors">Donate</Link></li>
              <li><Link to="/get-involved" className="hover:text-white transition-colors">Volunteer</Link></li>
              <li><Link to="/get-involved" className="hover:text-white transition-colors">Partnerships</Link></li>
              <li><Link to="/transparency" className="hover:text-white transition-colors">Transparency</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-white">{site.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>{site.address.line1}<br />{site.address.line2}</span>
              </li>
            </ul>
            <p className="text-xs text-white/50 mt-4">{site.officeHours}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} {site.name}. All rights reserved. Developed by Draftbit Studios.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/transparency" className="hover:text-white transition-colors">Transparency Report</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
