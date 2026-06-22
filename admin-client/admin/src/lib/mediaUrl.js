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
