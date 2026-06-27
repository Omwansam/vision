import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapGalleryImage } from '@/lib/mappers'
import { galleryImages as fallbackGallery } from '@/data/galleryImages'

function mapFallbackGalleryImage(image) {
  return mapGalleryImage({
    url: image.secure_url,
    publicId: image.public_id,
    title: image.title,
    category: image.category,
  })
}

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(null)

  const { data } = useApiData(async () => {
    try {
      const res = await api.getGallery()
      return res.data?.length ? res.data.map(mapGalleryImage) : fallbackGallery.map(mapFallbackGalleryImage)
    } catch {
      return fallbackGallery.map(mapFallbackGalleryImage)
    }
  }, [])

  const galleryImages = data ?? fallbackGallery.map(mapFallbackGalleryImage)

  usePageMeta('Gallery - Vision Mentors Group')

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === null || prev === 0 ? galleryImages.length - 1 : prev - 1,
    )
  }

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === null || prev === galleryImages.length - 1 ? 0 : prev + 1,
    )
  }

  return (
    <PageLayout className="bg-gradient-to-b from-background to-white">
      <PageHero
        title="Impact Gallery"
        description="Visual stories from our education, health, and resilience programs in Kenya. Click any image to view in full screen."
      />

      <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryImages.map((image, idx) => (
                <AnimationWrapper key={image.public_id || image.publicId || idx} animation="scale-in" delay={idx * 50}>
                  <button
                    type="button"
                    className="group relative overflow-hidden rounded-lg h-64 w-full cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-500"
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <img
                      src={image.secure_url}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                  </button>
                </AnimationWrapper>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Stories Behind the Photos</h2>
              <p className="text-lg text-muted-foreground">
                Each photograph represents real lives changed, communities strengthened, and hope restored.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'From Crisis to Stability',
                  story: 'When floods devastated the region, families lost their homes and livelihoods. Within 72 hours, GRF deployed emergency food supplies to 2,500 families. Today, six months later, 78% of those families have rebuilt their livelihoods with our support. This photo captures the moment a family received their first meal after the disaster.',
                },
                {
                  title: 'Education Through Nutrition',
                  story: "Seven-year-old Ahmed had never attended school consistently—hunger kept him home. When the School Feeding Program began, everything changed. Today, Ahmed hasn't missed a day of school in 14 months and his reading level has improved by two grades. His story is repeated in 240 schools across 12 countries.",
                },
                {
                  title: 'Community-Led Solutions',
                  story: "We didn't tell this village what they needed. We asked. Their response: a sustainable food distribution system led by local volunteers. Two years later, the community has taken full ownership of the program. We now provide oversight and resources, while they lead delivery. This photo shows community members distributing to their neighbors with dignity.",
                },
                {
                  title: 'Volunteer Journeys',
                  story: 'Maria came to volunteer for one month. She stayed for two years. What kept her? Witnessing the real impact of transparent, dignified work. In that time, she helped 4,000+ families and trained 50 new volunteers. Her journey represents thousands of volunteers who found purpose in this work.',
                },
              ].map((story) => (
                <div key={story.title} className="bg-white rounded-lg p-8 border border-border">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{story.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{story.story}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Photography Ethics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: 'Consent & Dignity', description: 'Every person photographed has provided explicit consent. We never photograph individuals without permission, especially children. Dignity is non-negotiable.' },
                { title: 'Authentic Moments', description: 'No staged photos. Every image captures real moments of genuine help and authentic community interaction. We avoid imagery that exploits or patronizes.' },
                { title: 'Community Agency', description: 'We share photos with the communities photographed. Local leaders have approval rights. Their voices shape how their stories are told.' },
                { title: 'Impact Verification', description: 'GPS coordinates and timestamps accompany all program photos. We provide verification data to donors so they can confirm authentic implementation.' },
              ].map((ethic) => (
                <div key={ethic.title} className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-8 border border-primary/10">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{ethic.title}</h3>
                  <p className="text-muted-foreground">{ethic.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>

          <button
            type="button"
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 bg-black/40 p-2 rounded-full hover:bg-black/60"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
            <img
              src={galleryImages[selectedIndex].secure_url}
              alt={galleryImages[selectedIndex].title}
              className="max-w-full max-h-[90vh] object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg'
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-50 bg-black/40 p-2 rounded-full hover:bg-black/60"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-2 rounded-full text-sm">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </PageLayout>
  )
}
