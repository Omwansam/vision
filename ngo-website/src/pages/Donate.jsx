import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, TrendingUp, Globe } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const CURRENCIES = {
  KES: { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling (KSh)' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
}

const GIFT_TIERS = [
  {
    id: 'tier1',
    amounts: { KES: 3000, USD: 25, EUR: 23, GBP: 20 },
    description: 'School supplies for 5 children',
    impact: 'Notebooks, pencils, and learning materials for one term',
  },
  {
    id: 'tier2',
    amounts: { KES: 10000, USD: 75, EUR: 70, GBP: 60 },
    description: 'Maternal health outreach',
    impact: 'Supports antenatal visits for 3 mothers',
  },
  {
    id: 'tier3',
    amounts: { KES: 25000, USD: 200, EUR: 185, GBP: 160 },
    description: 'ECD program support',
    impact: 'Funds play-based learning for 40 children for one month',
  },
  {
    id: 'custom',
    amounts: null,
    description: 'Choose your own amount',
    impact: 'Designate funds to the program that matters most to you',
  },
]

function formatAmount(currency, value) {
  const formatted = Number(value).toLocaleString()
  if (currency === 'KES') return `KSh ${formatted}`
  const { symbol } = CURRENCIES[currency]
  return `${symbol}${formatted}`
}

function getGiftOptions(currency) {
  return GIFT_TIERS.map((tier) => ({
    id: tier.id,
    value: tier.amounts?.[currency] ?? null,
    amount: tier.amounts ? formatAmount(currency, tier.amounts[currency]) : 'Custom',
    description: tier.description,
    impact: tier.impact,
  }))
}

const programs = [
  { id: 'ecd', label: 'Early Childhood Development' },
  { id: 'maternal', label: 'Maternal Health' },
  { id: 'resilience', label: 'Community Resilience' },
  { id: 'general', label: 'Where Most Needed' },
]

export default function Donate() {
  const [currency, setCurrency] = useState('KES')
  const [selectedGift, setSelectedGift] = useState('tier2')
  const [isMonthly, setIsMonthly] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [program, setProgram] = useState('general')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [referenceCode, setReferenceCode] = useState('')

  const giftOptions = getGiftOptions(currency)

  usePageMeta(
    'Donate - Vision Mentors Group',
    'Support education, health, and resilience programs in Kenya with a secure donation to Vision Mentors Group.',
  )

  const selected = giftOptions.find((g) => g.id === selectedGift)
  const displayAmount = selectedGift === 'custom'
    ? (customAmount ? formatAmount(currency, customAmount) : '—')
    : selected?.amount

  const handleCurrencyChange = (nextCurrency) => {
    setCurrency(nextCurrency)
    setCustomAmount('')
  }

  const handleDonate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const amountValue =
      selectedGift === 'custom'
        ? parseFloat(customAmount)
        : selected?.value

    try {
      const res = await api.createDonation({
        donorName: donorName || 'Anonymous Donor',
        donorEmail,
        amount: amountValue,
        currency,
        type: isMonthly ? 'monthly' : 'one_time',
        designation: program,
      })
      setReferenceCode(res.data?.referenceCode || '')
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Failed to record donation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout>
      <PageHero
        title="Support Our Mission"
        description="Your donation directly funds education, health, and resilience programs in Kenya. Every contribution creates measurable impact."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <Card className="p-12 text-center border-2 border-primary/20">
              <Heart className="mx-auto text-primary mb-4" size={48} />
              <h2 className="text-2xl font-bold text-foreground mb-3">Thank You for Your Generosity</h2>
              <p className="text-muted-foreground mb-6">
                Your {isMonthly ? 'monthly ' : ''}pledge of {displayAmount} toward{' '}
                {programs.find((p) => p.id === program)?.label} has been recorded.
                {referenceCode && <> Reference: <strong>{referenceCode}</strong>.</>}
                {' '}Our team will follow up with payment instructions.
              </p>
              <Button asChild variant="outline">
                <Link to="/impact">See Your Impact</Link>
              </Button>
            </Card>
          ) : (
            <form onSubmit={handleDonate}>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div className="w-full sm:max-w-xs">
                  <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-white"
                  >
                    {Object.values(CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg border border-border p-1 bg-muted">
                  <button
                    type="button"
                    onClick={() => setIsMonthly(false)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      !isMonthly ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    One-time
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMonthly(true)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      isMonthly ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {giftOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedGift(option.id)}
                    className="text-left"
                  >
                    <Card
                      className={cn(
                        'p-6 h-full border-2 transition-colors cursor-pointer hover:border-primary/50',
                        selectedGift === option.id ? 'border-primary bg-primary/5' : 'border-border',
                      )}
                    >
                      <p className="text-2xl font-bold text-primary mb-1">{option.amount}</p>
                      <p className="text-sm font-medium text-foreground mb-2">{option.description}</p>
                      <p className="text-xs text-muted-foreground">{option.impact}</p>
                    </Card>
                  </button>
                ))}
              </div>

              {selectedGift === 'custom' && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Enter amount ({CURRENCIES[currency].symbol === 'KSh' ? 'KSh' : CURRENCIES[currency].code})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full max-w-xs px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={currency === 'KES' ? 'e.g. 5000' : 'e.g. 150'}
                  />
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-2">Designate to program</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full max-w-md px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              <Card className="p-6 mb-8 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Your {isMonthly ? 'monthly ' : ''}gift</p>
                <p className="text-2xl font-bold text-foreground">
                  {displayAmount}
                  {isMonthly && displayAmount !== '—' && <span className="text-base font-normal text-muted-foreground"> / month</span>}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  → {programs.find((p) => p.id === program)?.label}
                </p>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your name</label>
                  <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input type="email" required value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="you@example.com" />
                </div>
              </div>

              {error && <p className="text-sm text-destructive mb-4">{error}</p>}

              <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90" disabled={submitting}>
                {submitting ? 'Processing…' : isMonthly ? 'Start Monthly Giving' : 'Complete Donation'}
              </Button>
            </form>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Transparency in Action</h2>
            <p className="text-lg text-muted-foreground">Here's exactly what happens with your donation</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { step: '1', title: 'You Donate', description: 'Your gift is processed securely and you receive immediate confirmation with a tracking reference.' },
              { step: '2', title: 'Funds Allocated', description: '98% of your donation goes directly to the program you selected.' },
              { step: '3', title: 'Program Execution', description: 'Supplies, training, and services reach communities within documented timeframes.' },
              { step: '4', title: 'Impact Documented', description: 'You receive photos, stories, and impact reports showing outcomes achieved.' },
              { step: '5', title: 'Full Accountability', description: 'Annual transparency reports published on our website for public review.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 md:gap-6">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link to="/transparency">Read Transparency Report</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: 'Impact Dashboard', description: 'Track how your donation creates measurable change across our programs.' },
              { icon: Heart, title: 'Monthly Stories', description: 'Receive inspiring updates from communities you support.' },
              { icon: Globe, title: 'Global Community', description: 'Join donors worldwide committed to dignified, transparent development.' },
            ].map((benefit) => {
              const Icon = benefit.icon
              return (
                <Card key={benefit.title} className="p-8 text-center border-2 border-primary/10">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
