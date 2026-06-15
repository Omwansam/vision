const MOCK_USERS_KEY = 'vmg_admin_mock_users'
const SESSION_KEY = 'vmg_admin_session'
const TOKEN_KEY = 'vmg_admin_token'

export const DEFAULT_MOCK_USERS = [
  {
    id: 'mock-admin',
    name: 'VMG Admin',
    email: 'admin@vmg.local',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'mock-editor',
    name: 'Content Editor',
    email: 'editor@vmg.local',
    password: 'editor123',
    role: 'editor',
  },
  {
    id: 'mock-procurement',
    name: 'Procurement Officer',
    email: 'procurement@vmg.local',
    password: 'proc123',
    role: 'procurement',
  },
  {
    id: 'mock-finance',
    name: 'Finance Officer',
    email: 'finance@vmg.local',
    password: 'finance123',
    role: 'finance',
  },
]

export class MockAuthError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MockAuthError'
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function seedMockUsers() {
  const existing = readJson(MOCK_USERS_KEY, null)
  if (existing?.length) return existing

  writeJson(MOCK_USERS_KEY, DEFAULT_MOCK_USERS)
  return DEFAULT_MOCK_USERS
}

export function getMockUsers() {
  return readJson(MOCK_USERS_KEY, DEFAULT_MOCK_USERS)
}

export function getMockSessionUser() {
  const session = readJson(SESSION_KEY, null)
  if (!session?.userId) return null

  const users = getMockUsers()
  const user = users.find((u) => u.id === session.userId)
  if (!user) return null

  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function getMockToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function isMockSession() {
  return getMockToken()?.startsWith('mock-') ?? false
}

export function mockLogin(email, password) {
  seedMockUsers()

  const normalizedEmail = email.trim().toLowerCase()
  const user = getMockUsers().find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password,
  )

  if (!user) {
    throw new MockAuthError('Invalid email or password')
  }

  const token = `mock-${user.id}-${Date.now()}`
  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role }

  writeJson(SESSION_KEY, { userId: user.id, loggedInAt: new Date().toISOString() })
  localStorage.setItem(TOKEN_KEY, token)

  return { token, user: sessionUser }
}

export function mockLogout() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export function resetMockUsers() {
  writeJson(MOCK_USERS_KEY, DEFAULT_MOCK_USERS)
  mockLogout()
  return DEFAULT_MOCK_USERS
}
