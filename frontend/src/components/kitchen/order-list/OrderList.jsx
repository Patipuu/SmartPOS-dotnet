import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../../../api/client'
import { useOrderHubKitchen } from '../../../hooks/useOrderHub'
import OrderItem from '../order-item/OrderItem'
import './OrderList.css'

const normalizeOrder = (o) => ({
  id: o.id,
  tableId: o.tableId,
  tableName: o.tableName,
  createdAt: o.createdAt,
  items: (o.items || []).map((i) => ({
    id: i.id,
    name: i.menuItemName,
    quantity: i.quantity,
    status: (i.status || '').toLowerCase(),
    note: i.note,
  })),
})

const OrderList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(() => {
    apiClient
      .get('/api/Kitchen/orders')
      .then(({ data }) => setOrders(Array.isArray(data) ? data.map(normalizeOrder) : []))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được đơn hàng'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useOrderHubKitchen((newOrder) => {
    setOrders((prev) => {
      const normalized = normalizeOrder(newOrder)
      const exists = prev.some((o) => o.id === normalized.id)
      if (exists) return prev.map((o) => (o.id === normalized.id ? normalized : o))
      return [normalized, ...prev]
    })
  })

  if (loading) return <div className="order-list"><p>Đang tải...</p></div>
  if (error) return <div className="order-list"><p className="order-list-error">{error}</p></div>

  return (
    <div className="order-list">
      <h2>Danh sách đơn hàng</h2>
      {orders.length === 0 ? (
        <p className="no-orders">Chưa có đơn hàng</p>
      ) : (
        <div className="orders">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} onStatusUpdated={fetchOrders} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderList
