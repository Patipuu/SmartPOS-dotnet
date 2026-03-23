import { useState } from 'react'
import { apiClient } from '../../../api/client'
import './StatusUpdate.css'

const StatusUpdate = ({ itemId, currentStatus, onUpdated }) => {
  const [status, setStatus] = useState((currentStatus || '').toLowerCase())
  const [loading, setLoading] = useState(false)

  const handleStatusChange = (newStatus) => {
    const apiStatus = newStatus === 'preparing' ? 'Preparing' : 'Ready'
    setLoading(true)
    apiClient
      .put(`/api/Kitchen/order-item/${itemId}/status`, { status: apiStatus })
      .then(() => {
        setStatus(newStatus)
        onUpdated?.()
      })
      .finally(() => setLoading(false))
  }

  const getStatusButton = (statusValue, label) => (
    <button
      type="button"
      className={`status-btn ${status === statusValue ? 'active' : ''}`}
      onClick={() => handleStatusChange(statusValue)}
      disabled={loading}
    >
      {label}
    </button>
  )

  return (
    <div className="status-update">
      {status === 'pending' && getStatusButton('preparing', 'Nhận')}
      {status === 'preparing' && getStatusButton('ready', 'Hoàn thành')}

      {(status !== 'pending' && status !== 'preparing') && (
        <div className="status-placeholder">Trạng thái hiện tại: {currentStatus}</div>
      )}
    </div>
  )
}

export default StatusUpdate
