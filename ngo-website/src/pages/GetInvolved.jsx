import { Link } from 'react-router-dom'
import { useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Users, Briefcase, Heart } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapSiteSettings, volunteerRoleValue, partnershipTypeValue } from '@/lib/mappers'
import { mediaUrl } from '@/lib/mediaUrl'

export default function GetInvolved() {
  const [volunteerForm, setVolunteerForm] = useState({
    fullName: '', email: '', phone: '', preferredRole: '', availability: '', message: '',
  })
  const [partnerForm, setPartnerForm] = useState({
    organizationName: '', contactName: '', email: '', phone: '', partnershipType: '', vision: '',
  })
  const [volunteerSubmitted, setVolunteerSubmitted] = useState(false)
  const [partnerSubmitted, setPartnerSubmitted] = useState(false)
  const [volunteerError, setVolunteerError] = useState('')
  const [partnerError, setPartnerError] = useState('')

  const { data: siteSettings } = useApiData(async () => {
    try {
      const res = await api.getSite()
      return res.data ? mapSiteSettings(res.data) : null
    } catch {
      return null
    }
  }, [])

  const volunteerImage = mediaUrl(
    siteSettings?.getInvolvedImage1Url || '/uploads/general/gallery-1.jpg',
  )
  const partnershipImage = mediaUrl(
    siteSettings?.getInvolvedImage2Url || '/uploads/general/gallery-2.jpg',
  )

  usePageMeta('Get Involved - Vision Mentors Group')

  const submitVolunteer = async (e) => {
    e.preventDefault()
    setVolunteerError('')
    try {
      await api.submitVolunteer({
        ...volunteerForm,
        preferredRole: volunteerRoleValue(volunteerForm.preferredRole),
      })
      setVolunteerSubmitted(true)
    } catch (err) {
      setVolunteerError(err.message || 'Submission failed')
    }
  }

  const submitPartner = async (e) => {
    e.preventDefault()
    setPartnerError('')
    try {
      await api.submitPartnership({
        organizationName: partnerForm.organizationName,
        contactName: partnerForm.contactName,
        email: partnerForm.email,
        phone: partnerForm.phone,
        partnershipType: partnershipTypeValue(partnerForm.partnershipType),
        vision: partnerForm.vision,
      })
      setPartnerSubmitted(true)
    } catch (err) {
      setPartnerError(err.message || 'Submission failed')
    }
  }

  return (
    <PageLayout>
      <PageHero
        title="Join Our Movement"
        description="Whether through volunteering, partnerships, or advocacy, there's a meaningful way for you to contribute to transparent, dignified humanitarian relief."
      />

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: 'Volunteer', description: 'Help distribute food, coordinate logistics, or provide support in communities. No experience necessary—we provide training.', link: '#volunteer-form' },
                { icon: Briefcase, title: 'Partner With Us', description: 'Corporate partnerships, institutional collaborations, and skill-sharing opportunities to scale our impact.', link: '#partner-form' },
                { icon: Heart, title: 'Donate', description: 'Support our work with financial contributions, in-kind donations, or recurring monthly gifts.', link: '/donate' },
              ].map((way) => {
                const Icon = way.icon
                const isInternal = way.link.startsWith('/')
                return (
                  <Card key={way.title} className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{way.title}</h3>
                    <p className="text-muted-foreground mb-6">{way.description}</p>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      {isInternal ? <Link to={way.link}>Learn More</Link> : <a href={way.link}>Learn More</a>}
                    </Button>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Volunteer Opportunities</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Our volunteers are the heart of everything we do. From direct food distribution to administrative support, there's a meaningful way to contribute.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Food Distribution Coordinator',
                    'Community Liaison & Engagement',
                    'Supply & Logistics Support',
                    'Impact Documentation',
                    'Translation & Cultural Support',
                    'Administration & Operations',
                  ].map((role) => (
                    <div key={role} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                      <span className="text-foreground">{role}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" asChild>
                  <a href="#volunteer-form">Apply to Volunteer</a>
                </Button>
              </div>

              <div className="relative h-80 rounded-lg overflow-hidden">
                <img
                  src={volunteerImage}
                  alt="Volunteers working together"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-80 rounded-lg overflow-hidden">
                <img
                  src={partnershipImage}
                  alt="Community partnership"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg'
                  }}
                />
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Partnership Opportunities</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We welcome partnerships with organizations, businesses, and institutions that share our commitment to transparency and human dignity.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Corporate Social Responsibility Programs',
                    'Supply Chain Partnerships',
                    'Skills & Expertise Sharing',
                    'Research & Impact Evaluation',
                    'Technology & Innovation',
                    'Advocacy & Policy Work',
                  ].map((partnership) => (
                    <div key={partnership} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-secondary flex-shrink-0 mt-1" />
                      <span className="text-foreground">{partnership}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" asChild variant="outline">
                  <a href="#partner-form">Discuss Partnership</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div id="volunteer-form">
                <h3 className="text-2xl font-bold text-foreground mb-6">Volunteer Form</h3>
                <Card className="p-8">
                  {volunteerSubmitted ? (
                    <p className="text-muted-foreground">Thank you for applying to volunteer. Our team will be in touch shortly.</p>
                  ) : (
                  <form className="space-y-4" onSubmit={submitVolunteer}>
                    {volunteerError && <p className="text-sm text-destructive">{volunteerError}</p>}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <input type="text" required value={volunteerForm.fullName} onChange={(e) => setVolunteerForm((p) => ({ ...p, fullName: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <input type="email" required value={volunteerForm.email} onChange={(e) => setVolunteerForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <input type="tel" value={volunteerForm.phone} onChange={(e) => setVolunteerForm((p) => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Preferred Volunteer Role</label>
                      <select required value={volunteerForm.preferredRole} onChange={(e) => setVolunteerForm((p) => ({ ...p, preferredRole: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Select a role</option>
                        <option>Food Distribution</option>
                        <option>Community Liaison</option>
                        <option>Logistics Support</option>
                        <option>Impact Documentation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Availability</label>
                      <textarea value={volunteerForm.availability} onChange={(e) => setVolunteerForm((p) => ({ ...p, availability: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" rows={3} placeholder="How often can you volunteer?" />
                    </div>
                    <Button className="w-full" type="submit">Submit Application</Button>
                  </form>
                  )}
                </Card>
              </div>

              <div id="partner-form">
                <h3 className="text-2xl font-bold text-foreground mb-6">Partnership Inquiry</h3>
                <Card className="p-8">
                  {partnerSubmitted ? (
                    <p className="text-muted-foreground">Thank you for your partnership inquiry. We will respond within a few business days.</p>
                  ) : (
                  <form className="space-y-4" onSubmit={submitPartner}>
                    {partnerError && <p className="text-sm text-destructive">{partnerError}</p>}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Organization Name</label>
                      <input type="text" required value={partnerForm.organizationName} onChange={(e) => setPartnerForm((p) => ({ ...p, organizationName: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Contact Name</label>
                      <input type="text" required value={partnerForm.contactName} onChange={(e) => setPartnerForm((p) => ({ ...p, contactName: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <input type="email" required value={partnerForm.email} onChange={(e) => setPartnerForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Partnership Type</label>
                      <select required value={partnerForm.partnershipType} onChange={(e) => setPartnerForm((p) => ({ ...p, partnershipType: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Select type</option>
                        <option>Corporate Partnership</option>
                        <option>Supply Chain</option>
                        <option>Technology</option>
                        <option>Research</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Partnership Vision</label>
                      <textarea required value={partnerForm.vision} onChange={(e) => setPartnerForm((p) => ({ ...p, vision: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" rows={3} placeholder="Tell us about your vision..." />
                    </div>
                    <Button className="w-full" type="submit">Submit Inquiry</Button>
                  </form>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Volunteer Stories</h2>
              <p className="text-lg text-muted-foreground">Hear from people making a difference</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Maria Rodriguez', role: 'Food Distribution Coordinator', quote: 'Volunteering with VMG showed me the real impact of transparency. I can see exactly how our work changes lives every single day.' },
                { name: 'James Okonkwo', role: 'Community Liaison', quote: "What impressed me most is how the organization treats beneficiaries with dignity. There's no us vs. them—it's a genuine partnership." },
                { name: 'Dr. Amina Hassan', role: 'Impact Documentation', quote: "The commitment to accountability and measurable outcomes aligned perfectly with my professional values. I'm proud to contribute." },
              ].map((story) => (
                <Card key={story.name} className="p-8 border-2 border-primary/10">
                  <p className="text-muted-foreground italic mb-6">"{story.quote}"</p>
                  <p className="font-semibold text-foreground">{story.name}</p>
                  <p className="text-sm text-primary">{story.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
    </PageLayout>
  )
}
