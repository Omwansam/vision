import { useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapSiteSettings } from '@/lib/mappers'
import { site as fallbackSite } from '@/data/site'

export default function Contact() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    subscribeToUpdates: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const { data } = useApiData(async () => {
    try {
      const res = await api.getSite()
      return res.data ? mapSiteSettings(res.data) : fallbackSite
    } catch {
      return fallbackSite
    }
  }, [])
  const site = data ?? fallbackSite

  usePageMeta('Contact - Vision Mentors Group')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.submitContact(form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout>
      <PageHero
        title="Let's Connect"
        description="Have questions about our work in Kenya? Want to partner or collaborate? We're excited to hear from you."
      />

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                { icon: Phone, title: 'Phone', detail: site.phone, subtext: site.officeHours },
                { icon: Mail, title: 'Email', detail: site.email, subtext: 'Typically responds within 24 hours' },
                { icon: MapPin, title: 'Headquarters', detail: site.addressLine1 || 'Karen, Nairobi', subtext: site.addressLine2 || 'Africa REIT House, 2nd Floor' },
                { icon: Clock, title: 'Office Hours', detail: 'Mon - Fri', subtext: site.officeHours || '9:00 AM - 5:00 PM EAT' },
              ].map((contact) => {
                const Icon = contact.icon
                return (
                  <Card key={contact.title} className="p-6 text-center border-2 border-primary/10 hover:border-primary/20 transition-colors">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{contact.title}</h3>
                    <p className="font-medium text-primary mb-1">{contact.detail}</p>
                    <p className="text-xs text-muted-foreground">{contact.subtext}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Send us a Message</h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
            </div>

            <Card className="p-8 md:p-12">
              {submitted ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Message sent</h3>
                  <p className="text-muted-foreground">Thank you for reaching out. We will respond within 24 business hours.</p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                      <input type="text" name="fullName" required value={form.fullName} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                      <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="your.email@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="+254 700 000 000" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                    <select name="subject" required value={form.subject} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                      <option value="">Select a subject</option>
                      <option value="donation">Donation Question</option>
                      <option value="volunteer">Volunteer Inquiry</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="program">Program Question</option>
                      <option value="feedback">Feedback</option>
                      <option value="media">Media Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                    <textarea name="message" required rows={6} value={form.message} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none" placeholder="Tell us how we can help..." />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="subscribeToUpdates" checked={form.subscribeToUpdates} onChange={handleChange} className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground">
                        I agree to receive updates about Vision Mentors Group's work
                      </span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2>

            <div className="space-y-6">
              {[
                { q: 'How quickly will I receive a response?', a: 'We typically respond to all inquiries within 24 business hours. For urgent matters, please call our office directly.' },
                { q: 'Can I visit one of your programs in person?', a: "Absolutely! We welcome donors, partners, and supporters to visit our programs. Please contact us with your interests and we'll arrange a visit with proper cultural preparation and safety briefing." },
                { q: 'How do I report a concern about a program?', a: 'We have a dedicated ethics and accountability team. You can submit concerns anonymously through our website or contact our Accountability Officer directly at accountability@visionmentorsgroup.org.' },
                { q: 'Do you have a media or press contact?', a: 'Yes! For media inquiries, press releases, or interviews, please contact our Communications Director at media@visionmentorsgroup.org.' },
              ].map((faq) => (
                <Card key={faq.q} className="p-6 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-foreground mb-3">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
    </PageLayout>
  )
}
