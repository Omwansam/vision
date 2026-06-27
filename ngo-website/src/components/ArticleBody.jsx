export function ArticleBody({ blocks }) {
  return (
    <div className="article-body space-y-6 text-muted-foreground leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={idx} className="text-xl font-bold text-foreground pt-2">
                {block.text}
              </h2>
            )
          case 'list':
            return (
              <ul key={idx} className="list-disc pl-6 space-y-2">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          case 'quote':
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-primary pl-6 py-2 my-6 bg-primary/5 rounded-r-lg"
              >
                <p className="text-foreground italic text-lg leading-relaxed">&ldquo;{block.text}&rdquo;</p>
                {block.attribution && (
                  <footer className="mt-3 text-sm font-medium text-muted-foreground not-italic">
                    — {block.attribution}
                  </footer>
                )}
              </blockquote>
            )
          default:
            return (
              <p key={idx} className="text-base">
                {block.text}
              </p>
            )
        }
      })}
    </div>
  )
}
