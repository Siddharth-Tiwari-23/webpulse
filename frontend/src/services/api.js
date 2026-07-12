const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  getWebsites: () => request('/websites'),
  addWebsite: (data) =>
    request('/websites', { method: 'POST', body: JSON.stringify(data) }),
  deleteWebsite: (id) => request(`/websites/${id}`, { method: 'DELETE' }),
  getStatus: () => request('/status'),
  getHistory: (websiteId, limit = 50) =>
    request(`/history?website_id=${websiteId}&limit=${limit}`),
}
