const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

function normalizeUploadPath(path) {
  if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  if (path.startsWith('/uploads/')) {
    return path
  }

  if (path.startsWith('/images/')) {
    return `/uploads/gallery/${path.slice('/images/'.length)}`
  }

  if (/^\/gallery-\d+\.jpg$/.test(path)) {
    return `/uploads/general${path}`
  }

  if (path.startsWith('/branding/')) {
    return `/uploads/general/${path.slice('/branding/'.length)}`
  }

  if (path === '/hero-team.jpg') {
    return '/uploads/general/hero-team.jpg'
  }

  return path
}

/**
 * Map /uploads/... paths to bundled static files in the SPA (public/ → dist/).
 * Used when the backend upload proxy is unavailable or the file is missing.
 */
export function staticImageFallback(path) {
  const normalized = normalizeUploadPath(path)
  if (!normalized) return '/placeholder.svg'

  if (normalized.startsWith('/uploads/gallery/')) {
    return `/images/${normalized.slice('/uploads/gallery/'.length)}`
  }

  if (normalized.startsWith('/uploads/general/')) {
    const file = normalized.slice('/uploads/general/'.length)
    if (file === 'vision-logo.png' || file === 'vmg-logo.jpg') return '/branding/vision-logo.png'
    return `/${file}`
  }

  if (normalized.startsWith('/images/') || normalized.startsWith('/branding/')) {
    return normalized
  }

  if (normalized === '/hero-team.jpg' || normalized === '/gallery-1.jpg' || normalized === '/gallery-2.jpg' || normalized === '/gallery-3.jpg') {
    return normalized
  }

  return '/placeholder.svg'
}

export function handleUploadImageError(e) {
  const img = e.currentTarget
  const fallback = staticImageFallback(img.getAttribute('data-upload-src') || img.src)
  if (fallback && img.src !== fallback && !img.src.endsWith(fallback)) {
    img.src = fallback
    return
  }
  img.src = '/placeholder.svg'
}

function hasBundledStaticCopy(path) {
  const normalized = normalizeUploadPath(path)
  if (!normalized || normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return false
  }
  return (
    normalized.startsWith('/uploads/gallery/')
    || normalized.startsWith('/uploads/general/')
    || normalized.startsWith('/images/')
    || normalized.startsWith('/branding/')
    || normalized === '/hero-team.jpg'
    || normalized === '/gallery-1.jpg'
    || normalized === '/gallery-2.jpg'
    || normalized === '/gallery-3.jpg'
  )
}

/**
 * Resolve an image for <img src>. Prefer static files from public/ (always served by nginx)
 * for seeded gallery and page images; use /uploads/ only for admin-only paths.
 */
export function displayImage(path, fallback = '') {
  const target = path || fallback
  if (!target) return ''

  const normalized = normalizeUploadPath(target)
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized
  }

  if (hasBundledStaticCopy(normalized)) {
    return staticImageFallback(normalized)
  }

  return mediaUrl(normalized)
}

/**
 * Resolve a stored upload path (/uploads/...) or external URL for use in img src.
 */
export function mediaUrl(path) {
  if (!path) return ''

  const normalized = normalizeUploadPath(path)
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized
  }

  const apiBase = API_BASE.replace(/\/$/, '')
  const origin = apiBase.replace(/\/api\/v1$/, '')
  return `${origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}
