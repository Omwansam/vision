import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { site as fallbackSite } from '@/data/site'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function parsePhoneNumbers(phone) {
  if (!phone) return []
  return phone.split(/\s*[·/|]\s*/).map((entry) => entry.trim()).filter(Boolean)
}

export function phoneToHref(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return `tel:+254${digits.slice(1)}`
  if (digits.startsWith('254')) return `tel:+${digits}`
  return `tel:${digits}`
}

export function getSiteContact(site = {}) {
  return {
    phone: site.phone || fallbackSite.phone,
    email: site.email || fallbackSite.email,
    addressLine1: site.address?.line1 || site.addressLine1 || fallbackSite.address.line1,
    addressLine2: site.address?.line2 || site.addressLine2 || fallbackSite.address.line2,
    officeHours: site.officeHours || fallbackSite.officeHours,
  }
}
