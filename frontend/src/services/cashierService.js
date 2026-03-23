import { apiClient } from '../api/client'

/**
 * GET /api/Cashier/terminals
 * @returns {Promise<Array<{ terminalId: number, location: string }>>}
 */
export async function getTerminals() {
  const { data } = await apiClient.get('/api/Cashier/terminals')
  return Array.isArray(data) ? data : []
}

/**
 * GET /api/Cashier/session/current
 * @returns {{ sessionId: number, openTime: string, openCash: number } | null}
 */
export async function getCurrentSession() {
  const { data } = await apiClient.get('/api/Cashier/session/current')
  return data
}

/**
 * POST /api/Cashier/session/open
 * @param {{ openCash: number, terminalId: number }}
 * @returns {{ message: string, sessionId: number }}
 */
export async function openSession({ openCash, terminalId }) {
  const { data } = await apiClient.post('/api/Cashier/session/open', { openCash, terminalId })
  return data
}

/**
 * POST /api/Cashier/session/close
 * @param {{ closeCash: number, closeNote?: string }}
 * @returns {{ message: string, cashDifference: number }}
 */
export async function closeSession({ closeCash, closeNote }) {
  const { data } = await apiClient.post('/api/Cashier/session/close', { closeCash, closeNote: closeNote || null })
  return data
}
