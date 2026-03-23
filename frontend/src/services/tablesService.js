import { apiClient } from '../api/client'

/**
 * GET /api/Admin/tables (Admin)
 * @returns {Promise<Array<{ tableId: number, code: string, name: string, status: string, capacity?: number, area?: string }>>}
 */
export async function getAdminTables() {
  const { data } = await apiClient.get('/api/Admin/tables')
  return Array.isArray(data) ? data : []
}

/**
 * GET /api/Cashier/tables (Cashier) - includes computed status PAYMENT_PENDING/SERVING/AVAILABLE
 * @returns {Promise<Array<{ tableId: number, code: string, tableName: string, status: string, capacity?: number, area?: string }>>}
 */
export async function getCashierTables() {
  const { data } = await apiClient.get('/api/Cashier/tables')
  return Array.isArray(data) ? data : []
}

/**
 * POST /api/Admin/tables
 * @param {{ code: string, name: string, capacity?: number, area?: string }}
 */
export async function createTable({ code, name, capacity, area }) {
  const { data } = await apiClient.post('/api/Admin/tables', { code, name, capacity: capacity ?? null, area: area || null })
  return data
}

/**
 * PUT /api/Admin/tables/{id}
 * @param {number} id
 * @param {{ name?: string, capacity?: number, area?: string }}
 */
export async function updateTable(id, { name, capacity, area }) {
  const { data } = await apiClient.put(`/api/Admin/tables/${id}`, { name, capacity, area })
  return data
}

/**
 * DELETE /api/Admin/tables/{id}
 * @param {number} id
 */
export async function deleteTable(id) {
  const { data } = await apiClient.delete(`/api/Admin/tables/${id}`)
  return data
}
