import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { ArticleBody } from '@/components/ArticleBody'
import { NewsCard } from '@/components/NewsCard'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapNewsArticle, mapFallbackNewsArticle, formatNewsDate, estimateReadTime } from '@/lib/mappers'
import { getNewsBySlug, getRelatedArticles } from '@/data/news'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Link2,
  Mail,
  Newspaper,
  Check,
} from 'lucide-react'

function NewsNotFound() {
  return (
    <PageLayout>
      <section className="py-24 text-center">
        <div className="max-w-lg mx-auto px-4">
          <Newspaper className="mx-auto text-muted-foreground mb-4" size={48} />
          <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">This story may have been moved or is no longer available.</p>
          <Button asChild>
            <Link to="/news">
              <ArrowLeft size={16} />
              Back to News
            </Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  )
}

function ShareButton({ article }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/news/${article.id}` : ''

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text: article.excerpt, url })
        return
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" className="w-full" onClick={handleShare}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? 'Link copied' : 'Share article'}
    </Button>
  )
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
      <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
    </div>
  )
}

export default function NewsDetail() {
  const { slug } = useParams()

  const { data: article, loading } = useApiData(async () => {
    try {
      const res = await api.getNewsArticle(slug)
      return mapNewsArticle(res.data)
    } catch {
      const fallback = getNewsBySlug(slug)
      return fallback ? mapFallbackNewsArticle(fallback) : null
    }
  }, [slug])

  const { data: allArticles = [] } = useApiData(async () => {
    try {
      const res = await api.getNews({ limit: 20 })
      return res.data?.map(mapNewsArticle) || []
    } catch {
      return []
    }
  }, [])

  const related = useMemo(() => {
    if (!article) return []
    const fromApi = allArticles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3)
    if (fromApi.length) return fromApi
    return getRelatedArticles(article.id).map(mapFallbackNewsArticle)
  }, [article, allArticles])

  usePageMeta(
    article ? `${article.title} - Vision Mentors Group` : 'Article Not Found - Vision Mentors Group',
    article?.excerpt,
  )

  if (loading) {
    return (
      <PageLayout>
        <section className="py-24 text-center text-muted-foreground">Loading article…</section>
      </PageLayout>
    )
  }

  if (!article) return <NewsNotFound />

  const readTime = estimateReadTime(article)
  const mailtoShare = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`Read this update from Vision Mentors Group: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`

  return (
    <PageLayout>
      <ReadingProgress />
      <article>
        <header className="relative">
          <div className="h-[280px] md:h-[420px] overflow-hidden">
            <img src={article.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C3D]/90 via-[#0B1C3D]/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
              <Button asChild variant="outline" size="sm" className="mb-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link to="/news"><ArrowLeft size={16} />All News</Link>
              </Button>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-white/80 bg-white/10 px-3 py-1 rounded-full mb-4">{article.category}</span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance mb-6">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5"><Calendar size={15} />{formatNewsDate(article.date)}</span>
                <span className="inline-flex items-center gap-1.5"><Clock size={15} />{readTime} min read</span>
                {article.author && <span className="inline-flex items-center gap-1.5"><User size={15} />{article.author}</span>}
              </div>
            </div>
          </div>
        </header>

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-14">
              <div className="min-w-0">
                <AnimationWrapper animation="fade-in" delay={0}>
                  <p className="text-xl text-foreground font-medium leading-relaxed mb-10 border-l-4 border-primary pl-6">{article.excerpt}</p>
                </AnimationWrapper>
                <AnimationWrapper animation="slide-up" delay={100}>
                  <ArticleBody blocks={article.body} />
                </AnimationWrapper>
              </div>
              <aside className="space-y-6">
                <Card className="p-6 sticky top-24">
                  <ShareButton article={article} />
                  <Button asChild variant="outline" size="sm" className="w-full mt-3">
                    <a href={mailtoShare}><Mail size={16} />Email article</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full mt-3">
                    <Link to="/news"><Link2 size={16} />More news</Link>
                  </Button>
                </Card>
              </aside>
            </div>
          </div>
        </section>
      </article>

      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-muted border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((item) => (
                <NewsCard key={item.id} article={item} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 border-t border-border">
        <div className="max-w-xl mx-auto px-4 text-center">
          <NewsletterSignup variant="inline" />
        </div>
      </section>
    </PageLayout>
  )
}
