import { BookOpen, Heart, Users } from 'lucide-react'

export const programs = [
  {
    id: 'ecd',
    title: 'Early Childhood Development',
    description:
      'Play-based learning, cognitive development, and parental engagement to build strong foundations for children ages 0-6.',
    image: '/uploads/gallery/kids-eating.jpg',
    images: [
      '/uploads/gallery/kids-eating.jpg',
      '/uploads/gallery/ecd-mother-child.webp',
      '/uploads/gallery/ecd-classroom.webp',
    ],
    icon: BookOpen,
    stats: [
      '4,500 children reached',
      '120 ECD centers supported',
      '65% improvement in school readiness',
    ],
  },
  {
    id: 'maternal-health',
    title: 'Maternal Health Initiative',
    description:
      'Strengthening health systems, improving access to quality maternal care, and building community health worker capacity.',
    image: '/uploads/gallery/maternal-health-initiative.png',
    icon: Heart,
    stats: [
      '8,000 mothers reached',
      '45 health facilities engaged',
      '38% reduction in maternal complications',
    ],
  },
  {
    id: 'community-resilience',
    title: 'Community Resilience',
    description:
      'Building local capacity, economic opportunities, and adaptive strategies to strengthen communities facing climate and economic challenges.',
    image: '/uploads/gallery/organized-relief.jpg',
    images: [
      '/uploads/gallery/organized-relief.jpg',
      '/uploads/gallery/flood-relief.jpg',
      '/uploads/gallery/food-relief-2.jpg',
      '/uploads/gallery/relief-distribution.jpg',
      '/uploads/gallery/hunger-relief.jpg',
      '/uploads/gallery/classroom-construction-1.jpg',
      '/uploads/gallery/classroom-construction-2.jpg',
    ],
    icon: Users,
    stats: [
      '12,500 community members',
      '45+ community groups engaged',
      'Sustainable livelihood improvements',
    ],
  },
]
