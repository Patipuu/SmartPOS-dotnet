import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { useOrderHubTable } from '../../../hooks/useOrderHub'
import './OrderStatus.css'

const OrderStatus = ({ tableId, onOrderCleared }) => {
  const [ordersStatus, setOrdersStatus] = useState([])
  const [requestingPayment, setRequestingPayment] = useState(false)
  const { orderStatus: signalRStatus } = useOrderHubTable(tableId)

  const normalizeOrder = (dto) => {
    if (!dto) return null
    return {
      orderId: dto.orderId,
      tableId: dto.tableId,
      status: dto.status,
      requestPayment: dto.requestPayment,
      items: (dto.items || []).map((i) => ({
        orderItemId: i.orderItemId,
        menuItemName: i.menuItemName,
        quantity: i.quantity,
        status: i.status,
      })),
    }
  }

  const normalizeOrders = (dto) => {
    if (!dto) return []
    // Backward compatible: old API returned a single order object.
    if (dto.orderId != null) {
      const single = normalizeOrder(dto)
      return single ? [single] : []
    }
    const orders = Array.isArray(dto.orders) ? dto.orders : []
    return orders.map(normalizeOrder).filter(Boolean)
  }

  const fetchStatus = useCallback(() => {
    if (tableId == null) return
    apiClient
      .get('/api/Customer/order/status', { params: { tableId } })
      .then(({ data }) => {
        const next = normalizeOrders(data)
        setOrdersStatus((prev) => {
          if (prev.length > 0 && next.length === 0 && onOrderCleared) queueMicrotask(() => onOrderCleared())
          return next
        })
      })
      .catch(() => setOrdersStatus([]))
  }, [tableId, onOrderCleared])

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 2000)
    return () => clearInterval(id)
  }, [fetchStatus])

  useEffect(() => {
    if (signalRStatus?.__cleared) {
      setOrdersStatus([])
      onOrderCleared?.()
      return
    }
    // SignalR payload currently sends a single order; keep polling as source of truth for full list.
  }, [signalRStatus, onOrderCleared])

  const handleRequestPayment = async (orderId) => {
    if (!orderId) return
    setRequestingPayment(true)
    try {
      await apiClient.post(`/api/Customer/order/${orderId}/request-payment`)
      fetchStatus()
    } finally {
      setRequestingPayment(false)
    }
  }

  const getStatusText = (status) => {
    const map = { Pending: 'Đang chờ', Preparing: 'Đang chế biến', Ready: 'Sẵn sàng', Served: 'Đã phục vụ', Rejected: 'Từ chối' }
    return map[status] || status
  }

  const hasOrders = ordersStatus.length > 0

  return (
    <div className="order-status">
      <h2>Trạng thái đơn hàng</h2>
      {!hasOrders ? (
        <p className="no-orders">Chưa có đơn hàng</p>
      ) : (
        <>
          {ordersStatus.map((order) => (
            <div key={order.orderId} className="orders-list">
              <h4>Đợt #{order.orderId}</h4>
              {order.items.map((item) => (
                <div key={item.orderItemId} className="order-item">
                  <div className="order-info">
                    <span className="order-name">{item.menuItemName}</span>
                    <span className="order-quantity">x{item.quantity}</span>
                  </div>
                  <span className={`status-badge status-${(item.status || '').toLowerCase()}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
              ))}
              {!order.requestPayment && (
                <button
                  type="button"
                  className="btn btn-success btn-request-payment"
                  onClick={() => handleRequestPayment(order.orderId)}
                  disabled={requestingPayment}
                >
                  {requestingPayment ? 'Đang gửi...' : 'Yêu cầu thanh toán'}
                </button>
              )}
              {order.requestPayment && (
                <p className="payment-requested">Đã yêu cầu thanh toán</p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default OrderStatus
