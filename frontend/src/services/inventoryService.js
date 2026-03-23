import { apiClient } from '../api/client'

export async function getInventoryItems() {
  const { data } = await apiClient.get('/api/Admin/inventory')
  return Array.isArray(data) ? data : []
}

export async function createInventoryItem({ name, unit, stockQty }) {
  const { data } = await apiClient.post('/api/Admin/inventory', { name, unit, stockQty })
  return data
}

export async function updateInventoryItem(id, { name, unit }) {
  const { data } = await apiClient.put(`/api/Admin/inventory/${id}`, { name, unit })
  return data
}

export async function importStock(inventoryItemId, quantity, reason) {
  const { data } = await apiClient.post('/api/Admin/inventory/import', { inventoryItemId, quantity, reason: reason || null })
  return data
}

export async function exportStock(inventoryItemId, quantity, reason) {
  const { data } = await apiClient.post('/api/Admin/inventory/export', { inventoryItemId, quantity, reason: reason || null })
  return data
}

export async function getStockTransactions({ inventoryItemId, type, limit = 50 } = {}) {
  const params = {}
  if (inventoryItemId != null) params.inventoryItemId = inventoryItemId
  if (type) params.type = type
  params.limit = limit
  const { data } = await apiClient.get('/api/Admin/inventory/transactions', { params })
  return Array.isArray(data) ? data : []
}
