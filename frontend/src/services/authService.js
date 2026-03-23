import { apiClient } from '../api/client'

export async function changePassword(currentPassword, newPassword) {
  const { data } = await apiClient.post('/api/Auth/change-password', {
    currentPassword,
    newPassword,
  })
  return data
}
