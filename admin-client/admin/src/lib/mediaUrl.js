const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * Resolve a stored upload path (/uploads/...) or external URL for use in img src.
 */
export function mediaUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }

  const apiBase = API_BASE.replace(/\/$/, '')
  const origin = apiBase.replace(/\/api\/v1$/, '')
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
