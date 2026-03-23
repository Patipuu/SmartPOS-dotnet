import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { useOrderHubKitchen } from '../../../hooks/useOrderHub'
import OrderItem from '../order-item/OrderItem'
import './OrderList.css'

const normalizeOrder = (o) => ({
  orderId: o.orderId,
  tableId: o.tableId,
  tableName: o.tableName,
  createdTime: o.createdTime,
  status: o.status,
  items: (o.items || []).map((i) => ({
    orderItemId: i.orderItemId,
    menuItemName: i.menuItemName,
    quantity: i.quantity,
    status: i.status,
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

  const handleNewOrder = useCallback((newOrder) => {
    setOrders((prev) => {
      const normalized = normalizeOrder(newOrder)
      const exists = prev.some((o) => o.orderId === normalized.orderId)
      if (exists) return prev.map((o) => (o.orderId === normalized.orderId ? normalized : o))
      return [normalized, ...prev]
    })
  }, [])

  useOrderHubKitchen(handleNewOrder)

  useEffect(() => {
    fetchOrders()
    // Polling fallback to avoid missing SignalR events
    const id = setInterval(fetchOrders, 2500)
    return () => clearInterval(id)
  }, [fetchOrders])

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
            <OrderItem key={order.orderId} order={order} onStatusUpdated={fetchOrders} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderList
