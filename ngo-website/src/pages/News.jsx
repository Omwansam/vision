import { useMemo, useState } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { NewsCard } from '@/components/NewsCard'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapNewsArticle, mapFallbackNewsArticle } from '@/lib/mappers'
import { newsArticles as fallbackNews } from '@/data/news'
import { Newspaper, Search } from 'lucide-react'

export default function News() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: articles = fallbackNews.map(mapFallbackNewsArticle) } = useApiData(async () => {
    try {
      const res = await api.getNews({ limit: 50 })
      return res.data?.length ? res.data.map(mapNewsArticle) : fallbackNews.map(mapFallbackNewsArticle)
    } catch {
      return fallbackNews.map(mapFallbackNewsArticle)
    }
  }, [])

  usePageMeta(
    'News & Updates - Vision Mentors Group',
    'Latest news, program updates, and announcements from Vision Mentors Group in Kenya.',
  )

  const categories = useMemo(() => {
    const unique = [...new Set(articles.map((a) => a.category))]
    return ['All', ...unique]
  }, [articles])

  const featured = useMemo(() => articles.find((a) => a.isFeatured) || articles[0], [articles])

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return articles.filter((article) => {
      const matchesCategory = activeCategory === 'All' || article.category === activeCategory
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery, articles])

  const showFeatured = activeCategory === 'All' && !searchQuery && featured
  const gridArticles = showFeatured
    ? filteredArticles.filter((article) => article.id !== featured.id)
    : filteredArticles

  return (
    <PageLayout>
      <PageHero
        title="News & Updates"
        description="Stories from the field, program milestones, and organizational announcements."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {showFeatured && (
            <AnimationWrapper animation="fade-in" delay={0}>
              <div className="mb-16">
                <NewsCard article={featured} variant="featured" />
              </div>
            </AnimationWrapper>
          )}

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridArticles.map((article, idx) => (
                <AnimationWrapper key={article.id} animation="slide-up" delay={idx * 80}>
                  <NewsCard article={article} />
                </AnimationWrapper>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Newspaper className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try a different category or search term.</p>
            </Card>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted border-t border-border">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Never miss an update</h2>
          <p className="text-muted-foreground mb-6">Subscribe for program news, impact stories, and tender announcements.</p>
          <NewsletterSignup variant="inline" />
        </div>
      </section>
    </PageLayout>
  )
}
