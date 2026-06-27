export function SafeImage({ src, alt, className = '', fallback = '/placeholder.svg', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        if (e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback
        }
      }}
      {...props}
    />
  )
}
