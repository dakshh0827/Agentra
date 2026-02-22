import api from './axios'

export const agentsAPI = {
  getAll: (params) => api.get('/agents', { params }),
  getById: (id) => api.get(`/agents/${id}`),
  deploy: (data) => api.post('/agents/deploy', data),
  execute: (id, task) => api.post(`/agents/${id}/execute`, { task }),
  vote: (id, vote) => api.post(`/agents/${id}/vote`, { vote }),
  getMetrics: (id) => api.get(`/agents/${id}/metrics`),
  search: (query) => api.get('/agents/search', { params: { q: query } }),
}