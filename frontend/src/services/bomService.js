import { apiClient } from '../api/client'

export async function getBOM(menuItemId) {
  const { data } = await apiClient.get(`/api/Admin/bom/${menuItemId}`)
  return Array.isArray(data) ? data : []
}

export async function saveBOM(menuItemId, entries) {
  const { data } = await apiClient.put(`/api/Admin/bom/${menuItemId}`, { entries })
  return data
}
