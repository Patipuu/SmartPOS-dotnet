import { apiClient } from '../api/client'

export async function getUsers() {
  const { data } = await apiClient.get('/api/Admin/users')
  return Array.isArray(data) ? data : []
}

export async function getRoles() {
  const { data } = await apiClient.get('/api/Admin/roles')
  return Array.isArray(data) ? data : []
}

export async function createUser({ username, password, displayName, roleId }) {
  const { data } = await apiClient.post('/api/Admin/users', { username, password, displayName: displayName || null, roleId })
  return data
}

export async function updateUser(id, { displayName, roleId, isActive }) {
  const { data } = await apiClient.put(`/api/Admin/users/${id}`, { displayName, roleId, isActive })
  return data
}

export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/api/Admin/users/${id}`)
  return data
}
