import { getStore, now, paginate, uid, updateStore } from '@/lib/mockStore'

export const mockApi = {
  getNews(params = {}) {
    const store = getStore()
    return paginate(store.news, params)
  },

  getNewsBySlug(slug) {
    const article = getStore().news.find((a) => a.slug === slug)
    if (!article) throw new Error('Article not found')
    return { success: true, data: article }
  },

  createNews(body) {
    const article = {
      id: uid('news'),
      ...body,
      status: body.status || 'draft',
      isFeatured: body.isFeatured ?? false,
      publishedAt: body.status === 'published' ? now() : body.publishedAt || null,
      createdAt: now(),
      updatedAt: now(),
    }
    updateStore((s) => ({ ...s, news: [article, ...s.news] }))
    return { success: true, data: article }
  },

  updateNews(id, body) {
    let updated
    updateStore((s) => ({
      ...s,
      news: s.news.map((a) => {
        if (a.id !== id) return a
        updated = { ...a, ...body, updatedAt: now() }
        if (body.status === 'published' && !updated.publishedAt) updated.publishedAt = now()
        return updated
      }),
    }))
    if (!updated) throw new Error('Article not found')
    return { success: true, data: updated }
  },

  deleteNews(id) {
    updateStore((s) => ({ ...s, news: s.news.filter((a) => a.id !== id) }))
    return { success: true, message: 'Article deleted' }
  },

  getPrograms() {
    const programs = getStore().programs.sort((a, b) => a.sortOrder - b.sortOrder)
    return { success: true, count: programs.length, data: programs }
  },

  createProgram(body) {
    const program = {
      id: uid('prog'),
      ...body,
      status: body.status || 'draft',
      sortOrder: body.sortOrder ?? getStore().programs.length,
      createdAt: now(),
      updatedAt: now(),
    }
    updateStore((s) => ({ ...s, programs: [...s.programs, program] }))
    return { success: true, data: program }
  },

  updateProgram(id, body) {
    let updated
    updateStore((s) => ({
      ...s,
      programs: s.programs.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, ...body, updatedAt: now() }
        return updated
      }),
    }))
    if (!updated) throw new Error('Program not found')
    return { success: true, data: updated }
  },

  deleteProgram(id) {
    updateStore((s) => ({ ...s, programs: s.programs.filter((p) => p.id !== id) }))
    return { success: true, message: 'Program deleted' }
  },

  getGallery() {
    const images = getStore().gallery.sort((a, b) => a.sortOrder - b.sortOrder)
    return { success: true, count: images.length, data: images }
  },

  createGalleryItem(body) {
    const image = {
      id: uid('gal'),
      ...body,
      status: body.status || 'published',
      sortOrder: body.sortOrder ?? getStore().gallery.length,
      createdAt: now(),
      updatedAt: now(),
    }
    updateStore((s) => ({ ...s, gallery: [...s.gallery, image] }))
    return { success: true, data: image }
  },

  updateGalleryItem(id, body) {
    let updated
    updateStore((s) => ({
      ...s,
      gallery: s.gallery.map((g) => {
        if (g.id !== id) return g
        updated = { ...g, ...body, updatedAt: now() }
        return updated
      }),
    }))
    if (!updated) throw new Error('Gallery item not found')
    return { success: true, data: updated }
  },

  deleteGalleryItem(id) {
    updateStore((s) => ({ ...s, gallery: s.gallery.filter((g) => g.id !== id) }))
    return { success: true, message: 'Gallery image deleted' }
  },

  uploadImage(folder) {
    return {
      success: true,
      data: {
        url: `/uploads/${folder}/mock-image-${Date.now()}.jpg`,
        mediaId: uid('media'),
        filename: `mock-image-${Date.now()}.jpg`,
        originalName: 'upload.jpg',
      },
    }
  },

  getImpact() {
    const store = getStore()
    return {
      success: true,
      data: {
        highlights: store.highlights.filter((h) => h.isActive),
        outcomes: store.outcomes.filter((o) => o.isActive),
      },
    }
  },

  upsertImpactHighlight(body) {
    let result
    updateStore((s) => {
      if (body.id) {
        const highlights = s.highlights.map((h) => {
          if (h.id !== body.id) return h
          result = { ...h, ...body, updatedAt: now() }
          return result
        })
        return { ...s, highlights }
      }
      result = { id: uid('hl'), ...body, isActive: body.isActive ?? true, sortOrder: body.sortOrder ?? s.highlights.length, createdAt: now(), updatedAt: now() }
      return { ...s, highlights: [...s.highlights, result] }
    })
    return { success: true, data: result }
  },

  deleteImpactHighlight(id) {
    updateStore((s) => ({ ...s, highlights: s.highlights.filter((h) => h.id !== id) }))
    return { success: true, message: 'Impact highlight deleted' }
  },

  upsertProgramOutcome(body) {
    let result
    updateStore((s) => {
      if (body.id) {
        const outcomes = s.outcomes.map((o) => {
          if (o.id !== body.id) return o
          result = { ...o, ...body, updatedAt: now() }
          return result
        })
        return { ...s, outcomes }
      }
      result = { id: uid('out'), ...body, isActive: body.isActive ?? true, sortOrder: body.sortOrder ?? s.outcomes.length, createdAt: now(), updatedAt: now() }
      return { ...s, outcomes: [...s.outcomes, result] }
    })
    return { success: true, data: result }
  },

  deleteProgramOutcome(id) {
    updateStore((s) => ({ ...s, outcomes: s.outcomes.filter((o) => o.id !== id) }))
    return { success: true, message: 'Program outcome deleted' }
  },

  getTenders(params = {}) {
    return paginate(getStore().tenders, params)
  },

  createTender(body) {
    const tender = {
      id: uid('tender'),
      ...body,
      status: body.status || 'open',
      currency: body.currency || 'KES',
      createdAt: now(),
      updatedAt: now(),
    }
    updateStore((s) => ({ ...s, tenders: [tender, ...s.tenders] }))
    return { success: true, data: tender }
  },

  updateTender(id, body) {
    let updated
    updateStore((s) => ({
      ...s,
      tenders: s.tenders.map((t) => {
        if (t.id !== id) return t
        updated = { ...t, ...body, updatedAt: now() }
        return updated
      }),
    }))
    if (!updated) throw new Error('Tender not found')
    return { success: true, data: updated }
  },

  deleteTender(id) {
    updateStore((s) => ({ ...s, tenders: s.tenders.filter((t) => t.id !== id) }))
    return { success: true, message: 'Tender deleted' }
  },

  getDonations(params = {}) {
    return paginate(getStore().donations, params)
  },

  updateDonation(id, body) {
    let updated
    updateStore((s) => ({
      ...s,
      donations: s.donations.map((d) => {
        if (d.id !== id) return d
        updated = { ...d, ...body, updatedAt: now() }
        return updated
      }),
    }))
    if (!updated) throw new Error('Donation not found')
    return { success: true, data: updated }
  },

  getContacts(params = {}) {
    return paginate(getStore().contacts, params)
  },

  updateContactStatus(id, status) {
    let updated
    updateStore((s) => ({
      ...s,
      contacts: s.contacts.map((c) => {
        if (c.id !== id) return c
        updated = { ...c, status, updatedAt: now() }
        return updated
      }),
    }))
    return { success: true, data: updated }
  },

  getVolunteers(params = {}) {
    return paginate(getStore().volunteers, params)
  },

  updateVolunteerStatus(id, status) {
    let updated
    updateStore((s) => ({
      ...s,
      volunteers: s.volunteers.map((v) => {
        if (v.id !== id) return v
        updated = { ...v, status, updatedAt: now() }
        return updated
      }),
    }))
    return { success: true, data: updated }
  },

  getPartnerships(params = {}) {
    return paginate(getStore().partnerships, params)
  },

  updatePartnershipStatus(id, status) {
    let updated
    updateStore((s) => ({
      ...s,
      partnerships: s.partnerships.map((p) => {
        if (p.id !== id) return p
        updated = { ...p, status, updatedAt: now() }
        return updated
      }),
    }))
    return { success: true, data: updated }
  },

  getNewsletterSubscribers(params = {}) {
    return paginate(getStore().newsletter, params)
  },

  getUsers() {
    const users = getStore().users
    return { success: true, count: users.length, data: users }
  },

  createUser(body) {
    const user = {
      id: uid('user'),
      name: body.name,
      email: body.email.trim().toLowerCase(),
      role: body.role,
      isActive: true,
      lastLogin: null,
      createdAt: now(),
      updatedAt: now(),
    }
    updateStore((s) => ({ ...s, users: [user, ...s.users] }))
    return { success: true, data: user }
  },

  updateUser(id, body) {
    let updated
    updateStore((s) => ({
      ...s,
      users: s.users.map((u) => {
        if (u.id !== id) return u
        updated = { ...u, ...body, updatedAt: now() }
        return updated
      }),
    }))
    if (!updated) throw new Error('User not found')
    return { success: true, data: updated }
  },

  deleteUser(id) {
    updateStore((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }))
    return { success: true, message: 'User deleted' }
  },

  getSite() {
    return { success: true, data: getStore().site }
  },

  updateSite(body) {
    let updated
    updateStore((s) => {
      updated = { ...s.site, ...body }
      if (Array.isArray(body.socialLinks)) {
        updated.socialLinks = body.socialLinks.map((link, index) => ({
          id: link.id || `soc-${index}`,
          ...link,
          sortOrder: link.sortOrder ?? index,
        }))
      }
      return { ...s, site: updated }
    })
    return { success: true, data: updated }
  },

  getEmailStatus() {
    return {
      success: true,
      data: { configured: true, from: 'noreply@visionmentorsgroup.org' },
    }
  },

  getEmailLogs(params = {}) {
    return paginate(getStore().emailLogs || [], params)
  },

  getNewsletterCampaigns(params = {}) {
    return paginate(getStore().campaigns || [], params)
  },

  getTenderAlertSubscribers(params = {}) {
    const { active } = params
    let items = getStore().tenderAlerts || []
    if (active === 'true') items = items.filter((s) => s.isActive)
    else if (active === 'false') items = items.filter((s) => !s.isActive)
    return paginate(items, params)
  },

  sendNewsletter(body) {
    const subscribers = getStore().newsletter.filter((s) => s.status === 'subscribed')
    const campaign = {
      id: uid('camp'),
      subject: body.subject,
      status: 'sent',
      sentCount: subscribers.length,
      totalRecipients: subscribers.length,
      createdAt: now(),
    }
    const logs = subscribers.map((s) => ({
      id: uid('email'),
      recipient: s.email,
      type: 'newsletter',
      status: 'sent',
      subject: body.subject,
      createdAt: now(),
    }))
    updateStore((s) => ({
      ...s,
      campaigns: [campaign, ...(s.campaigns || [])],
      emailLogs: [...logs, ...(s.emailLogs || [])],
    }))
    return {
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscriber(s)`,
      data: { sent: subscribers.length },
    }
  },

  sendTestEmail(to) {
    const log = {
      id: uid('email'),
      recipient: to,
      type: 'test',
      status: 'sent',
      subject: 'VMG Admin Test Email',
      createdAt: now(),
    }
    updateStore((s) => ({
      ...s,
      emailLogs: [log, ...(s.emailLogs || [])],
    }))
    return { success: true, message: 'Test email sent', data: { recipient: to } }
  },
}
