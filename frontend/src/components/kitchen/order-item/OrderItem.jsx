import StatusUpdate from '../status-update/StatusUpdate'
import './OrderItem.css'

const OrderItem = ({ order, onStatusUpdated }) => {
  const tableLabel = order.tableName || `Bàn ${order.tableId}`
  return (
    <div className="order-item-card kot-card">
      <div className="order-header">
        <span className="kot-badge">KOT</span>
        <h3>{tableLabel}</h3>
        <span className="order-time">
          {new Date(order.createdAt ?? order.createdTime).toLocaleTimeString('vi-VN')}
        </span>
      </div>
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id} className="order-item-row">
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
              {item.note && <span className="item-note">({item.note})</span>}
            </div>
            <StatusUpdate
              itemId={item.id}
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
