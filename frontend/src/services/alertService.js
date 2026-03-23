import { apiClient } from '../api/client'

export async function getAlerts({ status, limit = 20 } = {}) {
  const params = { limit }
  if (status) params.status = status
  const { data } = await apiClient.get('/api/Admin/alerts', { params })
  return Array.isArray(data) ? data : []
}

export async function resolveAlert(alertId) {
  const { data } = await apiClient.put(`/api/Admin/alerts/${alertId}/resolve`)
  return data
}
