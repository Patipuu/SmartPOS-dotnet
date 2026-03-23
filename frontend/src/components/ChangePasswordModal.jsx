import { useState } from 'react'
import { changePassword } from '../services/authService'
import './ChangePasswordModal.css'

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới tối thiểu 6 ký tự')
      return
    }
    setLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      alert('Đổi mật khẩu thành công')
      onClose?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose?.()}>
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Đổi mật khẩu</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={loading} />
          </div>
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={loading} />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
          </div>
          {error && <p className="modal-error">{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</button>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordModal
