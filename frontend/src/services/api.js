const BASE = (import.meta.env.VITE_API_BASE_URL ||
  'https://webpulse-backend.siddharthtiwari.me/api'
).replace(/\/$/, '')

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: res.statusText }))

    throw new Error(
      err.error || 'Request failed'
    )
  }

  return res.json()
}

export const api = {
  getWebsites: () =>
    request('/websites'),

  addWebsite: (data) =>
    request('/websites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteWebsite: (id) =>
    request(`/websites/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getStatus: () =>
    request('/status'),

  getHistory: (websiteId, limit = 50) =>
    request(
      `/history?website_id=${encodeURIComponent(
        websiteId
      )}&limit=${encodeURIComponent(limit)}`
    ),
}
