import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount, currency = 'KES') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text, length = 120) {
  if (!text) return ''
  return text.length <= length ? text : `${text.slice(0, length).trim()}…`
}

export function countByStatus(items, statusField = 'status') {
  return items.reduce(
    (acc, item) => {
      const key = item[statusField] || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      acc.total += 1
      return acc
    },
    { total: 0, published: 0, draft: 0, archived: 0 },
  )
}

export function countByCategory(items, field = 'category') {
  return items.reduce(
    (acc, item) => {
      const key = item[field] || 'Uncategorized'
      acc[key] = (acc[key] || 0) + 1
      acc.total += 1
      return acc
    },
    { total: 0 },
  )
}

export function filterImpactItems(items, search = '', { activeOnly = false } = {}) {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    if (activeOnly && item.isActive === false) return false
    if (!q) return true
    const haystack = Object.values(item).filter((v) => typeof v === 'string').join(' ').toLowerCase()
    return haystack.includes(q)
  })
}

export function countByRole(items, field = 'role') {
  return items.reduce(
    (acc, item) => {
      const key = item[field] || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      acc.total += 1
      return acc
    },
    { total: 0, admin: 0, editor: 0, procurement: 0, finance: 0 },
  )
}

export function filterUsers(items, { search = '', role = 'all' }) {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    if (role !== 'all' && item.role !== role) return false
    if (!q) return true
    const haystack = [item.name, item.email, item.role].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(q)
  })
}

export function filterSubmissions(items, { search = '', status = 'all' }) {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    if (status !== 'all' && item.status !== status) return false
    if (!q) return true
    const haystack = [
      item.fullName,
      item.contactName,
      item.organizationName,
      item.email,
      item.phone,
      item.subject,
      item.message,
      item.preferredRole,
      item.availability,
      item.partnershipType,
      item.vision,
      item.referenceCode,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function filterContentItems(items, { search = '', status = 'all' }) {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    if (status !== 'all' && item.status !== status) return false
    if (!q) return true
    const haystack = [
      item.title,
      item.slug,
      item.excerpt,
      item.description,
      item.category,
      item.altText,
      item.url,
      item.referenceId,
      item.location,
      item.budgetLabel,
      item.donorName,
      item.donorEmail,
      item.designation,
      item.type,
      item.referenceCode,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export function paginateClient(items, page = 1, limit = 20) {
  const total = items.length
  const pages = Math.ceil(total / limit) || 1
  const safePage = Math.min(Math.max(1, page), pages)
  const skip = (safePage - 1) * limit
  return {
    data: items.slice(skip, skip + limit),
    total,
    pages,
    page: safePage,
  }
}

export function daysUntil(date) {
  if (!date) return null
  const diff = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function deadlineLabel(date) {
  const days = daysUntil(date)
  if (days == null) return '—'
  if (days < 0) return 'Expired'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `${days} days left`
}

