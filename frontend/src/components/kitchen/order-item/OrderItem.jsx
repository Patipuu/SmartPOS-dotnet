import { useEffect, useMemo, useState } from 'react'
import StatusUpdate from '../status-update/StatusUpdate'
import './OrderItem.css'

const THRESHOLD_MINUTES = 15

function formatMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(sec / 60)
  const ss = sec % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

const OrderItem = ({ order, onStatusUpdated }) => {
  const tableLabel = order.tableName || `Bàn ${order.tableId}`
  const createdAt = order.createdTime ? new Date(order.createdTime) : null
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    const created = order.createdTime ? new Date(order.createdTime) : null
    if (!created) return
    const tick = () => {
      const diffMs = Date.now() - created.getTime()
      setElapsedSec(diffMs / 1000)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [order.createdTime])
  const isOverThreshold = useMemo(() => (elapsedSec / 60) >= THRESHOLD_MINUTES, [elapsedSec])

  return (
    <div
      className="order-item-card kot-card"
      style={{ borderLeftColor: isOverThreshold ? '#e74c3c' : '#e67e22' }}
    >
      <div className="order-header">
        <span className="kot-badge">KOT</span>
        <h3>{tableLabel}</h3>
        <span className="order-time">
          {createdAt ? createdAt.toLocaleTimeString('vi-VN') : '-'}
        </span>
        <span className={`kot-timer ${isOverThreshold ? 'timer-over' : ''}`}>
          {createdAt ? formatMMSS(elapsedSec) : '00:00'}
        </span>
      </div>
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.orderItemId} className="order-item-row">
            <div className="item-info">
              <span className="item-name">{item.menuItemName}</span>
              <span className="item-quantity">x{item.quantity}</span>
              {item.note && <span className="item-note">({item.note})</span>}
            </div>
            <StatusUpdate
              itemId={item.orderItemId}
              currentStatus={item.status}
              onUpdated={onStatusUpdated}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderItem
