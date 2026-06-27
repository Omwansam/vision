const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body } = options
  const headers = { 'Content-Type': 'application/json' }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data.error || data.message || 'Request failed', res.status)
  }

  return data
}

function withQuery(path, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ).toString()
  return `${path}${qs ? `?${qs}` : ''}`
}

export const api = {
  getSite: () => request('/site'),
  getPrograms: (params) => request(withQuery('/programs', params)),
  getProgram: (slug) => request(`/programs/${slug}`),
  getNews: (params) => request(withQuery('/news', params)),
  getNewsArticle: (slug) => request(`/news/${slug}`),
  getGallery: (params) => request(withQuery('/gallery', params)),
  getImpact: () => request('/impact'),
  getTransparency: (params) => request(withQuery('/transparency', params)),
  getTenders: (params) => request(withQuery('/tenders', params)),
  getTender: (referenceId) => request(`/tenders/by-reference/${encodeURIComponent(referenceId)}`),
  getPartners: () => request('/partners'),
  getTestimonials: () => request('/testimonials'),

  submitContact: (body) => request('/forms/contact', { method: 'POST', body }),
  subscribeNewsletter: (body) => request('/forms/newsletter/subscribe', { method: 'POST', body }),
  submitVolunteer: (body) => request('/forms/volunteers', { method: 'POST', body }),
  submitPartnership: (body) => request('/forms/partnerships', { method: 'POST', body }),
  subscribeTenderAlerts: (body) => request('/tenders/alerts/subscribe', { method: 'POST', body }),
  createDonation: (body) => request('/donations', { method: 'POST', body }),
}

export { ApiError }
