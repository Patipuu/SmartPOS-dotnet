import { useCallback, useEffect, useState } from 'react'
import * as alertService from '../../../services/alertService'
import './AlertsPlaceholder.css'

const AlertsPlaceholder = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('') // '' | 'Active' | 'Resolved'
  const [resolvingId, setResolvingId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const list = await alertService.getAlerts({ status: filter || undefined, limit: 20 })
      setAlerts(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải cảnh báo')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  useEffect(() => {
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [load])

  const handleResolve = async (alertId) => {
    setResolvingId(alertId)
    try {
      await alertService.resolveAlert(alertId)
      await load()
    } catch {
      setError('Xử lý thất bại')
    } finally {
      setResolvingId(null)
    }
  }

  const formatTime = (d) => {
    if (!d) return '-'
    const date = new Date(d)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    return date.toLocaleString('vi-VN')
  }

  const getAlertClass = (type) => {
    if (type === 'LowStock') return 'alert-lowstock'
    if (type === 'DelayedOrder') return 'alert-delayed'
    return ''
  }

  return (
    <div className="alerts-placeholder">
      <h2>Cảnh báo vận hành</h2>
      {error && <p className="placeholder-note" style={{ color: '#e74c3c' }}>{error}</p>}

      <div className="alerts-filter" style={{ marginBottom: 16 }}>
        <button type="button" className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>Tất cả</button>
        <button type="button" className={filter === 'Active' ? 'active' : ''} onClick={() => setFilter('Active')}>Đang hoạt động</button>
        <button type="button" className={filter === 'Resolved' ? 'active' : ''} onClick={() => setFilter('Resolved')}>Đã xử lý</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : alerts.length === 0 ? (
        <p>Chưa có cảnh báo.</p>
      ) : (
        <div className="alerts-list">
          {alerts.map((a) => (
            <div key={a.alertId} className={`alert-card ${getAlertClass(a.type)} ${a.status === 'Resolved' ? 'alert-resolved' : ''}`}>
              <div className="alert-header">
                <span className="alert-type">{a.type}</span>
                <span className="alert-time">{formatTime(a.createdAt)}</span>
              </div>
              <p className="alert-message">{a.message || a.type}</p>
              {a.status === 'Active' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleResolve(a.alertId)}
                  disabled={resolvingId === a.alertId}
                >
                  {resolvingId === a.alertId ? 'Đang xử lý...' : 'Đánh dấu đã xử lý'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertsPlaceholder
