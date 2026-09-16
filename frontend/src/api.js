export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

async function request(path, options = {}) {
  const token = localStorage.getItem('sahirate_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.detail || 'Something went wrong')
  return body
}

export const api = {
  prices: () => request('/prices'),
  trends: (material) => request(`/trends/${encodeURIComponent(material)}`),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  googleLogin: (token, role) => request('/auth/google', { method: 'POST', body: JSON.stringify({ token, role }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  authority: () => request('/dashboard/authority'),
  collector: () => request('/dashboard/collector'),
  createLot: (data) => request('/lots', { method: 'POST', body: JSON.stringify(data) })
}