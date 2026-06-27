import { BookOpen, Heart, Users } from 'lucide-react'
import { mediaUrl } from '@/lib/mediaUrl'

const ICON_MAP = {
  BookOpen,
  Heart,
  Users,
}

const PARTNERSHIP_TYPE_MAP = {
  'Corporate Partnership': 'corporate',
  'Supply Chain': 'supply_chain',
  Technology: 'technology',
  Research: 'research',
  Advocacy: 'advocacy',
  Other: 'other',
}

const VOLUNTEER_ROLE_MAP = {
  'Food Distribution': 'food_distribution',
  'Community Liaison': 'community_liaison',
  'Logistics Support': 'logistics_support',
  'Impact Documentation': 'impact_documentation',
  Translation: 'translation',
  Administration: 'administration',
  Other: 'other',
}

const TENDER_CATEGORY_LABELS = {
  goods: 'Goods',
  works: 'Works',
  services: 'Services',
}

export function tenderPath(referenceId) {
  return encodeURIComponent(referenceId)
}

export function tenderReferenceFromParam(param) {
  return decodeURIComponent(param)
}

export function mapProgram(program) {
  const images = program.images?.map((img) => mediaUrl(img.url)) || []
  const imageUrl = mediaUrl(program.imageUrl) || images[0] || '/placeholder.svg'

  return {
    id: program.slug,
    slug: program.slug,
    title: program.title,
    description: program.description,
    image: imageUrl,
    images: images.length ? images : [imageUrl],
    icon: ICON_MAP[program.iconName] || BookOpen,
    stats: (program.stats || []).map((stat) =>
      stat.label && stat.value ? `${stat.value} ${stat.label}` : stat.label || stat.value || String(stat),
    ),
  }
}

export function mapFallbackProgram(program) {
  const images = (program.images || []).map((url) => mediaUrl(url))
  const image = mediaUrl(program.image)

  return {
    ...program,
    image,
    images: images.length ? images : [image],
  }
}

export function mapNewsArticle(article) {
  return {
    id: article.slug,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    date: article.publishedAt || article.createdAt,
    category: article.category,
    image: mediaUrl(article.imageUrl) || '/placeholder.svg',
    author: article.author?.name || 'Vision Mentors Group',
    isFeatured: article.isFeatured,
    body: parseArticleBody(article.body, article.excerpt),
  }
}

export function mapFallbackNewsArticle(article) {
  return {
    ...article,
    image: mediaUrl(article.image) || '/placeholder.svg',
  }
}

export function parseArticleBody(body, excerpt) {
  if (!body) {
    return excerpt ? [{ type: 'paragraph', text: excerpt }] : []
  }

  if (Array.isArray(body)) return body

  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // Plain text — split into paragraphs.
    }

    return body
      .split(/\n\n+/)
      .filter(Boolean)
      .map((text) => ({ type: 'paragraph', text: text.trim() }))
  }

  return []
}

export function mapGalleryImage(image) {
  return {
    secure_url: mediaUrl(image.url),
    public_id: image.publicId || image.id,
    title: image.title,
    category: image.category,
  }
}

export function mapTender(tender) {
  return {
    id: tender.referenceId,
    slug: tenderPath(tender.referenceId),
    referenceId: tender.referenceId,
    title: tender.title,
    category: TENDER_CATEGORY_LABELS[tender.category] || tender.category,
    status: tender.status,
    published: tender.publishedAt,
    deadline: tender.deadline,
    location: tender.location,
    description: tender.description,
    budget: tender.budgetLabel || formatBudget(tender),
    awardedTo: tender.awardedTo,
    documents: tender.documents || [],
  }
}

function formatBudget(tender) {
  if (tender.budgetLabel) return tender.budgetLabel
  if (tender.budgetMin || tender.budgetMax) {
    const currency = tender.currency || 'KES'
    if (tender.budgetMin && tender.budgetMax) {
      return `${currency} ${tender.budgetMin} – ${tender.budgetMax}`
    }
    return `${currency} ${tender.budgetMin || tender.budgetMax}`
  }
  return null
}

export function mapPartner(partner) {
  return {
    id: partner.id,
    name: partner.name,
    type: partner.type,
    logo: mediaUrl(partner.logoUrl),
    website: partner.website,
  }
}

export function mapTestimonial(testimonial) {
  return {
    id: testimonial.id,
    quote: testimonial.quote,
    name: testimonial.name,
    role: testimonial.role,
    type: testimonial.type,
    image: mediaUrl(testimonial.imageUrl),
  }
}

export function mapSiteSettings(settings) {
  return {
    name: settings.name,
    shortName: settings.shortName,
    tagline: settings.tagline,
    description: settings.description,
    email: settings.email,
    tendersEmail: settings.tendersEmail,
    phone: settings.phone,
    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    address: {
      line1: settings.addressLine1,
      line2: settings.addressLine2,
    },
    officeHours: settings.officeHours,
    heroImageUrl: settings.heroImageUrl,
    aboutImageUrl: settings.aboutImageUrl,
    getInvolvedImage1Url: settings.getInvolvedImage1Url,
    getInvolvedImage2Url: settings.getInvolvedImage2Url,
    logoImageUrl: settings.logoImageUrl,
    social: (settings.socialLinks || []).map((link) => ({
      platform: link.platform,
      url: link.url,
      label: link.label,
      href: link.url,
    })),
  }
}

export function mapMissionVision(settings) {
  return {
    mission: settings.mission,
    vision: settings.vision,
  }
}

export function mapImpactHighlight(highlight) {
  return {
    value: highlight.value,
    label: highlight.label,
  }
}

export function mapProgramOutcome(outcome) {
  return {
    program: outcome.program,
    metric: outcome.metric,
    detail: outcome.detail,
  }
}

export function mapFundAllocation(item) {
  return {
    category: item.category,
    percentage: Number(item.percentage),
  }
}

export function mapTransparencyDocument(doc) {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.category ? doc.category.charAt(0).toUpperCase() + doc.category.slice(1) : doc.type,
    year: String(doc.year || ''),
    fileUrl: doc.fileUrl,
  }
}

export function volunteerRoleValue(label) {
  return VOLUNTEER_ROLE_MAP[label] || 'other'
}

export function partnershipTypeValue(label) {
  return PARTNERSHIP_TYPE_MAP[label] || 'other'
}

export function formatNewsDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function estimateReadTime(articleOrBlocks) {
  const blocks = Array.isArray(articleOrBlocks) ? articleOrBlocks : articleOrBlocks?.body
  const text = Array.isArray(blocks)
    ? blocks.map((b) => (b.type === 'list' ? b.items?.join(' ') : b.text) || '').join(' ')
    : String(blocks || '')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
