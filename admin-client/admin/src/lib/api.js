import { isMockSession } from '@/lib/mockAuth'
import { mockApi } from '@/lib/mockApi'
import { seedMockStore } from '@/lib/mockStore'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'
const TOKEN_KEY = 'vmg_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, auth = true } = options
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

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

async function requestMultipart(path, formData, method = 'POST') {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: formData,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data.error || data.message || 'Request failed', res.status)
  }

  return data
}

function useMock() {
  if (isMockSession()) {
    seedMockStore()
    return true
  }
  return import.meta.env.VITE_USE_MOCK_DATA === 'true'
}

function call(mockFn, realFn) {
  return (...args) => (useMock() ? mockFn(...args) : realFn(...args))
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  getMe: () => request('/auth/me'),

  getNews: call(mockApi.getNews, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/news${qs ? `?${qs}` : ''}`)
  }),

  getNewsBySlug: call(mockApi.getNewsBySlug, (slug) => request(`/news/${slug}`)),

  createNews: call(mockApi.createNews, (body) => {
    if (body instanceof FormData) return requestMultipart('/news', body)
    return request('/news', { method: 'POST', body })
  }),

  updateNews: call(mockApi.updateNews, (id, body) => {
    if (body instanceof FormData) return requestMultipart(`/news/${id}`, body, 'PUT')
    return request(`/news/${id}`, { method: 'PUT', body })
  }),

  deleteNews: call(mockApi.deleteNews, (id) => request(`/news/${id}`, { method: 'DELETE' })),

  getPrograms: call(mockApi.getPrograms, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/programs${qs ? `?${qs}` : ''}`)
  }),

  createProgram: call(mockApi.createProgram, (body) => {
    if (body instanceof FormData) return requestMultipart('/programs', body)
    return request('/programs', { method: 'POST', body })
  }),

  updateProgram: call(mockApi.updateProgram, (id, body) => {
    if (body instanceof FormData) return requestMultipart(`/programs/${id}`, body, 'PUT')
    return request(`/programs/${id}`, { method: 'PUT', body })
  }),

  deleteProgram: call(mockApi.deleteProgram, (id) => request(`/programs/${id}`, { method: 'DELETE' })),

  getGallery: call(mockApi.getGallery, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/gallery${qs ? `?${qs}` : ''}`)
  }),

  createGalleryItem: call(mockApi.createGalleryItem, (body) => {
    if (body instanceof FormData) {
      return requestMultipart('/gallery', body)
    }
    return request('/gallery', { method: 'POST', body })
  }),

  updateGalleryItem: call(mockApi.updateGalleryItem, (id, body) => {
    if (body instanceof FormData) {
      return requestMultipart(`/gallery/${id}`, body, 'PUT')
    }
    return request(`/gallery/${id}`, { method: 'PUT', body })
  }),

  uploadImage: call(mockApi.uploadImage, (folder, formData) =>
    requestMultipart(`/uploads/${folder}`, formData),
  ),

  deleteGalleryItem: call(mockApi.deleteGalleryItem, (id) => request(`/gallery/${id}`, { method: 'DELETE' })),

  getImpact: call(mockApi.getImpact, () => request('/impact')),

  upsertImpactHighlight: call(mockApi.upsertImpactHighlight, (body) =>
    request('/impact/highlights', { method: 'POST', body }),
  ),

  deleteImpactHighlight: call(mockApi.deleteImpactHighlight, (id) =>
    request(`/impact/highlights/${id}`, { method: 'DELETE' }),
  ),

  upsertProgramOutcome: call(mockApi.upsertProgramOutcome, (body) =>
    request('/impact/outcomes', { method: 'POST', body }),
  ),

  deleteProgramOutcome: call(mockApi.deleteProgramOutcome, (id) =>
    request(`/impact/outcomes/${id}`, { method: 'DELETE' }),
  ),

  getTenders: call(mockApi.getTenders, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/tenders${qs ? `?${qs}` : ''}`)
  }),

  createTender: call(mockApi.createTender, (body) => request('/tenders', { method: 'POST', body })),

  updateTender: call(mockApi.updateTender, (id, body) => request(`/tenders/${id}`, { method: 'PUT', body })),

  deleteTender: call(mockApi.deleteTender, (id) => request(`/tenders/${id}`, { method: 'DELETE' })),

  getDonations: call(mockApi.getDonations, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/donations${qs ? `?${qs}` : ''}`)
  }),

  updateDonation: call(mockApi.updateDonation, (id, body) =>
    request(`/donations/${id}`, { method: 'PATCH', body }),
  ),

  getContacts: call(mockApi.getContacts, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/submissions/contact${qs ? `?${qs}` : ''}`)
  }),

  updateContactStatus: call(
    (id, status) => mockApi.updateContactStatus(id, status),
    (id, status) => request(`/submissions/contact/${id}`, { method: 'PATCH', body: { status } }),
  ),

  getVolunteers: call(mockApi.getVolunteers, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/submissions/volunteers${qs ? `?${qs}` : ''}`)
  }),

  updateVolunteerStatus: call(
    (id, status) => mockApi.updateVolunteerStatus(id, status),
    (id, status) => request(`/submissions/volunteers/${id}`, { method: 'PATCH', body: { status } }),
  ),

  getPartnerships: call(mockApi.getPartnerships, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/submissions/partnerships${qs ? `?${qs}` : ''}`)
  }),

  updatePartnershipStatus: call(
    (id, status) => mockApi.updatePartnershipStatus(id, status),
    (id, status) => request(`/submissions/partnerships/${id}`, { method: 'PATCH', body: { status } }),
  ),

  getNewsletterSubscribers: call(mockApi.getNewsletterSubscribers, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/submissions/newsletter${qs ? `?${qs}` : ''}`)
  }),

  getUsers: call(mockApi.getUsers, () => request('/users')),

  createUser: call(mockApi.createUser, (body) => request('/users', { method: 'POST', body })),

  updateUser: call(mockApi.updateUser, (id, body) => request(`/users/${id}`, { method: 'PUT', body })),

  deleteUser: call(mockApi.deleteUser, (id) => request(`/users/${id}`, { method: 'DELETE' })),

  getSite: call(mockApi.getSite, () => request('/site')),

  updateSite: call(mockApi.updateSite, (body) => {
    if (body instanceof FormData) return requestMultipart('/site', body, 'PUT')
    return request('/site', { method: 'PUT', body })
  }),

  getEmailStatus: call(mockApi.getEmailStatus, () => request('/notifications/status')),

  getEmailLogs: call(mockApi.getEmailLogs, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/notifications/logs${qs ? `?${qs}` : ''}`)
  }),

  getNewsletterCampaigns: call(mockApi.getNewsletterCampaigns, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/notifications/campaigns${qs ? `?${qs}` : ''}`)
  }),

  getTenderAlertSubscribers: call(mockApi.getTenderAlertSubscribers, (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/notifications/tender-alerts${qs ? `?${qs}` : ''}`)
  }),

  sendNewsletter: call(mockApi.sendNewsletter, (body) =>
    request('/notifications/newsletter/send', { method: 'POST', body }),
  ),

  sendTestEmail: call(mockApi.sendTestEmail, (to) =>
    request('/notifications/test', { method: 'POST', body: { to } }),
  ),
}

export { ApiError }
