import { DEFAULT_MOCK_USERS } from '@/lib/mockAuth'

const STORE_KEY = 'vmg_admin_data'

function uid(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function now() {
  return new Date().toISOString()
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function paginate(items, { page = 1, limit = 20, status } = {}) {
  let list = [...items]
  if (status) list = list.filter((item) => item.status === status)
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  const total = list.length
  const pages = Math.ceil(total / limit) || 1
  const skip = (Math.max(1, page) - 1) * limit
  return {
    success: true,
    data: list.slice(skip, skip + limit),
    count: Math.min(limit, total - skip),
    total,
    page: Math.max(1, page),
    pages,
  }
}

function buildSeedStore() {
  const ts = now()

  return {
    news: [
      {
        id: uid('news'),
        slug: 'ecd-centres-2025',
        title: '120 ECD Centres Receive New Learning Kits',
        excerpt:
          'Our latest procurement delivered play-based learning materials to centres across Nairobi and Kiambu.',
        body: 'Full article content about the ECD learning kit delivery program.',
        category: 'Programs',
        imageUrl: '/images/ecd-classroom.webp',
        status: 'published',
        isFeatured: true,
        publishedAt: '2025-05-20T00:00:00.000Z',
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('news'),
        slug: 'maternal-health-drive',
        title: 'Maternal Health Outreach Reaches 2,000 Mothers',
        excerpt: 'Community health workers completed a month-long awareness campaign.',
        body: 'Details about the maternal health outreach initiative.',
        category: 'Health',
        imageUrl: '/images/maternal-health-initiative.png',
        status: 'published',
        isFeatured: false,
        publishedAt: '2025-04-12T00:00:00.000Z',
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('news'),
        slug: 'annual-report-2024',
        title: '2024 Annual Impact Report Published',
        excerpt: 'Our transparency report details program outcomes and financial stewardship.',
        body: '',
        category: 'Transparency',
        imageUrl: '/gallery-1.jpg',
        status: 'draft',
        isFeatured: false,
        publishedAt: null,
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    programs: [
      {
        id: uid('prog'),
        slug: 'ecd',
        title: 'Early Childhood Development',
        description: 'Play-based learning and parental engagement for children ages 0-6.',
        imageUrl: '/images/kids-eating.jpg',
        iconName: 'BookOpen',
        status: 'published',
        sortOrder: 0,
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('prog'),
        slug: 'maternal-health',
        title: 'Maternal Health Initiative',
        description: 'Strengthening health systems and maternal care access.',
        imageUrl: '/images/maternal-health-initiative.png',
        iconName: 'Heart',
        status: 'published',
        sortOrder: 1,
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('prog'),
        slug: 'community-resilience',
        title: 'Community Resilience',
        description: 'Building local capacity and economic opportunities.',
        imageUrl: '/images/organized-relief.jpg',
        iconName: 'Users',
        status: 'published',
        sortOrder: 2,
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    gallery: [
      {
        id: uid('gal'),
        title: 'Children Sharing Meals',
        category: 'Early Childhood Development',
        url: '/images/kids-eating.jpg',
        altText: 'Children Sharing Meals',
        status: 'published',
        sortOrder: 0,
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('gal'),
        title: 'Maternal Health Initiative',
        category: 'Maternal Health',
        url: '/images/maternal-health-initiative.png',
        altText: 'Maternal Health Initiative',
        status: 'published',
        sortOrder: 1,
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('gal'),
        title: 'Emergency Food Distribution',
        category: 'Community Resilience',
        url: '/images/food-relief-1.jpg',
        altText: 'Emergency Food Distribution',
        status: 'published',
        sortOrder: 2,
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    tenders: [
      {
        id: uid('tender'),
        referenceId: 'DF/2026/001',
        title: 'Supply and Delivery of Dry Foodstuffs',
        description: 'Framework contract for supply and delivery of dry foodstuffs.',
        category: 'goods',
        status: 'open',
        publishedAt: '2026-06-11T00:00:00.000Z',
        deadline: '2026-07-31T00:00:00.000Z',
        location: 'Nairobi, Kenya',
        budgetLabel: null,
        currency: 'KES',
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('tender'),
        referenceId: 'VMG-T-2025-004',
        title: 'Supply of ECD Learning Kits',
        description: 'Supply and delivery of age-appropriate learning kits for 120 ECD centres.',
        category: 'goods',
        status: 'open',
        publishedAt: '2025-05-15T00:00:00.000Z',
        deadline: '2025-06-30T00:00:00.000Z',
        location: 'Nairobi & Kiambu Counties',
        budgetLabel: 'KES 2,400,000 – 3,000,000',
        currency: 'KES',
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('tender'),
        referenceId: 'VMG-T-2025-001',
        title: 'Program Impact Evaluation Consultancy',
        description: 'Independent evaluation of ECD and maternal health programs.',
        category: 'services',
        status: 'awarded',
        publishedAt: '2025-02-01T00:00:00.000Z',
        deadline: '2025-03-01T00:00:00.000Z',
        location: 'Remote / Kenya',
        budgetLabel: 'KES 1,200,000 – 1,500,000',
        awardedTo: 'East Africa Research Partners',
        currency: 'KES',
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    donations: [
      {
        id: uid('don'),
        donorName: 'Dr. Sarah Mitchell',
        donorEmail: 'sarah.mitchell@example.com',
        amount: 15000,
        currency: 'KES',
        type: 'monthly',
        designation: 'ecd',
        status: 'completed',
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('don'),
        donorName: 'Anonymous',
        donorEmail: null,
        amount: 5000,
        currency: 'KES',
        type: 'one_time',
        designation: 'general',
        status: 'pending',
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    contacts: [
      {
        id: uid('contact'),
        fullName: 'Jane Wanjiru',
        email: 'jane.w@example.com',
        phone: '+254712000001',
        subject: 'volunteer',
        message: 'I would like to volunteer with your food distribution program in Kiambu.',
        status: 'new',
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('contact'),
        fullName: 'Michael Otieno',
        email: 'm.otieno@example.com',
        phone: '+254712000002',
        subject: 'partnership',
        message: 'Our NGO is interested in partnering on maternal health outreach.',
        status: 'in_progress',
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    volunteers: [
      {
        id: uid('vol'),
        fullName: 'Grace Akinyi',
        email: 'grace.a@example.com',
        phone: '+254712000003',
        preferredRole: 'community_liaison',
        availability: 'Weekends',
        message: 'Experienced community organizer, available weekends.',
        status: 'new',
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    partnerships: [
      {
        id: uid('partner'),
        organizationName: 'Kenya Health Network',
        contactName: 'David Kimani',
        email: 'd.kimani@healthnet.ke',
        phone: '+254712000004',
        partnershipType: 'research',
        vision: 'Joint research on maternal health outcomes in rural counties.',
        status: 'new',
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    newsletter: [
      {
        id: uid('nl'),
        email: 'subscriber@example.com',
        status: 'subscribed',
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: uid('nl'),
        email: 'updates@example.org',
        status: 'subscribed',
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    emailLogs: [
      {
        id: uid('email'),
        recipient: 'subscriber@example.com',
        type: 'newsletter',
        status: 'sent',
        subject: 'March 2025 Program Update',
        createdAt: ts,
      },
      {
        id: uid('email'),
        recipient: 'admin@vmg.local',
        type: 'test',
        status: 'sent',
        subject: 'VMG Admin Test Email',
        createdAt: ts,
      },
      {
        id: uid('email'),
        recipient: 'jane.w@example.com',
        type: 'contact_confirmation',
        status: 'sent',
        subject: 'We received your message',
        createdAt: ts,
      },
    ],
    campaigns: [
      {
        id: uid('camp'),
        subject: 'March 2025 Program Update',
        status: 'sent',
        sentCount: 2,
        totalRecipients: 2,
        createdAt: ts,
      },
    ],
    tenderAlerts: [
      {
        id: uid('alert'),
        email: 'procurement@example.org',
        isActive: true,
        subscribedAt: ts,
        createdAt: ts,
      },
      {
        id: uid('alert'),
        email: 'vendor@company.ke',
        isActive: true,
        subscribedAt: ts,
        createdAt: ts,
      },
    ],
    highlights: [
      { id: uid('hl'), value: '12,500+', label: 'Children supported through ECD programs', year: 2024, sortOrder: 0, isActive: true },
      { id: uid('hl'), value: '8,000+', label: 'Mothers reached with maternal health services', year: 2024, sortOrder: 1, isActive: true },
      { id: uid('hl'), value: '45+', label: 'Communities engaged across 2 counties', year: 2024, sortOrder: 2, isActive: true },
      { id: uid('hl'), value: '98%', label: 'Program funds directed to field activities', year: 2024, sortOrder: 3, isActive: true },
    ],
    outcomes: [
      { id: uid('out'), program: 'Early Childhood Development', metric: '65%', detail: 'improvement in school readiness scores', year: 2024, sortOrder: 0, isActive: true },
      { id: uid('out'), program: 'Maternal Health Initiative', metric: '38%', detail: 'reduction in reported maternal complications', year: 2024, sortOrder: 1, isActive: true },
      { id: uid('out'), program: 'Community Resilience', metric: '12,500', detail: 'community members supported with livelihood programs', year: 2024, sortOrder: 2, isActive: true },
    ],
    site: {
      id: 'site',
      name: 'Vision Mentors Group',
      shortName: 'VMG',
      tagline: 'Education, Health & Resilience in Kenya',
      description: 'Partnering with communities in Kenya to improve learning outcomes and resilience.',
      email: 'info@visionmentorsgroup.org',
      tendersEmail: 'tenders@visionmentorsgroup.org',
      phone: '+254 (0) 712 345 678',
      addressLine1: 'Africa REIT House, Karen',
      addressLine2: '2nd Floor, Nairobi, Kenya',
      officeHours: 'Monday – Friday, 9:00 AM – 5:00 PM EAT',
      mission: 'To partner with Kenyan communities through evidence-based education, health, and resilience programs.',
      vision: 'A Kenya where every child has a strong start and every community has the tools to thrive.',
      socialLinks: [
        { id: 'soc1', label: 'Facebook', href: 'https://facebook.com', isActive: true, sortOrder: 0 },
        { id: 'soc2', label: 'LinkedIn', href: 'https://linkedin.com', isActive: true, sortOrder: 1 },
      ],
    },
    users: DEFAULT_MOCK_USERS.map(({ id, name, email, role }) => ({
      id,
      name,
      email,
      role,
      isActive: true,
      lastLogin: ts,
      createdAt: ts,
      updatedAt: ts,
    })),
  }
}

export function seedMockStore() {
  const existing = readStore()
  if (existing) return existing
  const store = buildSeedStore()
  writeStore(store)
  return store
}

export function getStore() {
  return seedMockStore()
}

export function updateStore(updater) {
  const store = getStore()
  const next = typeof updater === 'function' ? updater(store) : updater
  writeStore(next)
  return next
}

export function resetMockStore() {
  localStorage.removeItem(STORE_KEY)
  return seedMockStore()
}

export { uid, now }
