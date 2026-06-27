import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { formatNewsDate } from '@/lib/mappers'
import { ArrowRight, Calendar, Tag } from 'lucide-react'

const categoryColors = {
  Programs: 'bg-primary/10 text-primary',
  Health: 'bg-green-100 text-green-800',
  Infrastructure: 'bg-amber-100 text-amber-900',
  Transparency: 'bg-secondary/10 text-secondary',
}

function CategoryBadge({ category }) {
  const className = categoryColors[category] ?? 'bg-muted text-muted-foreground'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
      <Tag size={12} />
      {category}
    </span>
  )
}

export function NewsCard({ article, variant = 'default' }) {
  const href = `/news/${article.id}`

  if (variant === 'featured') {
    return (
      <Link to={href} className="group block">
        <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-64 lg:h-auto min-h-[280px] overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <CategoryBadge category={article.category} />
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  {formatNewsDate(article.date)}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{article.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Read full story
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link to={href} className="group block">
        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow border hover:border-primary/20">
          <div className="h-44 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
            />
          </div>
          <div className="p-6">
            <CategoryBadge category={article.category} />
            <h3 className="font-bold text-foreground mt-3 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link to={href} className="group block h-full">
      <Card className="overflow-hidden h-full hover:shadow-lg transition-all border hover:border-primary/20">
        <div className="h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
          />
        </div>
        <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <CategoryBadge category={article.category} />
            <span className="text-xs text-muted-foreground shrink-0">{formatNewsDate(article.date)}</span>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{article.excerpt}</p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4">
            Read more
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Card>
    </Link>
  )
}
