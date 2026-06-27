export function LegalContent({ title, lastUpdated, children }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 legal-prose">
      <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>
      {children}
    </article>
  )
}
