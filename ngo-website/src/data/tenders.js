export const tenderProcessSteps = [
  {
    step: '1',
    title: 'Tender Published',
    description:
      'Open opportunities are posted on this page with reference number, scope, eligibility criteria, and submission deadline.',
  },
  {
    step: '2',
    title: 'Document Collection',
    description:
      'Interested bidders download the tender documents (TOR, BOQ, or specifications) and may attend a pre-bid meeting or site visit if required.',
  },
  {
    step: '3',
    title: 'Submission',
    description:
      'Proposals are submitted before the deadline—either physically at our office or electronically to tenders@visionmentorsgroup.org as specified in each notice.',
  },
  {
    step: '4',
    title: 'Evaluation',
    description:
      'A procurement committee reviews submissions against technical and financial criteria. Only compliant bids are scored and ranked.',
  },
  {
    step: '5',
    title: 'Award & Contract',
    description:
      'The successful bidder is notified in writing. Contracts are signed after due diligence, and awards are published on this page for transparency.',
  },
]

export const tenders = [
  {
    id: 'DF/2026/001',
    slug: 'DF-2026-001',
    title: 'Supply and Delivery of Dry Foodstuffs',
    category: 'Goods',
    contractType: 'Framework Contract',
    status: 'open',
    published: '2026-06-11',
    deadline: '2026-07-31',
    deadlineTime: '11:00 AM EAT',
    location: 'Nairobi, Kenya',
    description:
      'Framework contract for supply and delivery of dry foodstuffs to support operations at the Cerebral Palsy Caregiving and Rehabilitation Center. Supplies called off via Local Purchase Orders (LPOs) as needed.',
    budget: null,
    project: 'Cerebral Palsy Caregiving and Rehabilitation Center',
    relatedProcurement: ['Goods'],
  },
  {
    id: 'VMG-T-2025-004',
    title: 'Supply of Early Childhood Development Learning Kits',
    category: 'Goods',
    status: 'open',
    published: '2025-05-15',
    deadline: '2025-06-30',
    location: 'Nairobi & Kiambu Counties',
    description:
      'Supply and delivery of age-appropriate learning kits for 120 ECD centres, including manipulatives, storybooks, and teacher guides.',
    budget: 'KES 2,400,000 – 3,000,000',
  },
  {
    id: 'VMG-T-2025-003',
    title: 'Construction of Two-Classroom Block',
    category: 'Works',
    status: 'open',
    published: '2025-05-01',
    deadline: '2025-06-20',
    location: 'Kiambu County',
    description:
      'Design-build of a two-classroom block with sanitation facilities, compliant with Ministry of Education standards and local building codes.',
    budget: 'KES 8,500,000 – 10,000,000',
  },
  {
    id: 'VMG-T-2025-002',
    title: 'Maternal Health Commodities Supply',
    category: 'Goods',
    status: 'closed',
    published: '2025-03-10',
    deadline: '2025-04-15',
    location: 'Nairobi County',
    description:
      'Procurement and delivery of essential maternal health commodities to 45 partner health facilities.',
    budget: 'KES 1,800,000 – 2,200,000',
    awardedTo: 'Kenya Health Supplies Ltd.',
  },
  {
    id: 'VMG-T-2025-001',
    title: 'Program Impact Evaluation Consultancy',
    category: 'Services',
    status: 'awarded',
    published: '2025-02-01',
    deadline: '2025-03-01',
    location: 'Remote / Kenya',
    description:
      'Independent evaluation of ECD and maternal health programs across two counties, including baseline comparison and recommendations.',
    budget: 'KES 1,200,000 – 1,500,000',
    awardedTo: 'East Africa Research Partners',
  },
]

export function getTenderBySlug(slug) {
  return tenders.find((t) => t.slug === slug) ?? null
}

export const tenderFaqs = [
  {
    q: 'Who can apply for VMG tenders?',
    a: 'Registered businesses, NGOs, and consultants meeting the eligibility criteria stated in each tender document may apply. Joint ventures are permitted where explicitly allowed.',
  },
  {
    q: 'Is there a fee to obtain tender documents?',
    a: 'Most tender documents are free to download from this page. Where a document fee applies, it will be clearly stated in the tender notice.',
  },
  {
    q: 'How are bids evaluated?',
    a: 'Evaluation follows a two-envelope or combined approach as specified per tender. Technical compliance is assessed first; only technically responsive bids proceed to financial evaluation.',
  },
  {
    q: 'Can I submit bids after the deadline?',
    a: 'No. Late submissions are not accepted under any circumstances. We recommend submitting at least 24 hours before the closing time.',
  },
  {
    q: 'How will I know if my bid was successful?',
    a: 'All bidders are notified in writing after the evaluation period. Award results are also published on this page within 14 days of contract signing.',
  },
  {
    q: 'Where can I raise a procurement concern?',
    a: 'Contact our Procurement Officer at tenders@visionmentorsgroup.org or submit a written complaint to our Accountability Officer within 7 days of award notification.',
  },
]
