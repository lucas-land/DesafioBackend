const API_BASE = 'http://localhost:3001'
const STORAGE_KEY = 'auth'

let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.accessToken || !parsed?.usuario) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

function mensagemErro(body) {
  if (!body) return null
  if (typeof body.message === 'string') return body.message
  if (Array.isArray(body.message)) return body.message.join(' ')
  return null
}

export async function api(path, options = {}) {
  const { body, headers, ...rest } = options
  const session = getSession()
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    clearSession()
    onUnauthorized?.()
    const data = await response.json().catch(() => null)
    throw new Error(mensagemErro(data) || 'Sessão expirada. Faça login novamente.')
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(mensagemErro(data) || 'Falha na requisição')
  }
  return data
}
