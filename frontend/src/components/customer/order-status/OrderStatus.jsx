import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { useOrderHubTable } from '../../../hooks/useOrderHub'
import './OrderStatus.css'

const OrderStatus = ({ tableId, onOrderCleared }) => {
  const [orderStatus, setOrderStatus] = useState(null)
  const [requestingPayment, setRequestingPayment] = useState(false)
  const { orderStatus: signalRStatus } = useOrderHubTable(tableId)

  const normalize = (dto) => {
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

  const fetchStatus = useCallback(() => {
    if (tableId == null) return
    apiClient
      .get('/api/Customer/order/status', { params: { tableId } })
      .then(({ data }) => {
        const next = normalize(data)
        setOrderStatus((prev) => {
          if (prev != null && next === null && onOrderCleared) queueMicrotask(() => onOrderCleared())
          return next
        })
      })
      .catch(() => setOrderStatus(null))
  }, [tableId, onOrderCleared])

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 2000)
    return () => clearInterval(id)
  }, [fetchStatus])

  useEffect(() => {
    if (signalRStatus?.__cleared) {
      setOrderStatus(null)
      onOrderCleared?.()
      return
    }
    if (signalRStatus != null) setOrderStatus(normalize(signalRStatus))
  }, [signalRStatus, onOrderCleared])

  const handleRequestPayment = async () => {
    if (!orderStatus?.orderId) return
    setRequestingPayment(true)
    try {
      await apiClient.post(`/api/Customer/order/${orderStatus.orderId}/request-payment`)
      fetchStatus()
    } finally {
      setRequestingPayment(false)
    }
  }

  const getStatusText = (status) => {
    const map = { Pending: 'Đang chờ', Preparing: 'Đang chế biến', Ready: 'Sẵn sàng', Served: 'Đã phục vụ', Rejected: 'Từ chối' }
    return map[status] || status
  }

  const items = orderStatus?.items || []

  return (
    <div className="order-status">
      <h2>Trạng thái đơn hàng</h2>
      {!orderStatus ? (
        <p className="no-orders">Chưa có đơn hàng</p>
      ) : (
        <>
          <div className="orders-list">
          {items.map((item) => (
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
          </div>
          {orderStatus.orderId && !orderStatus.requestPayment && (
            <button
              type="button"
              className="btn btn-success btn-request-payment"
              onClick={handleRequestPayment}
              disabled={requestingPayment}
            >
              {requestingPayment ? 'Đang gửi...' : 'Yêu cầu thanh toán'}
            </button>
          )}
          {orderStatus.requestPayment && (
            <p className="payment-requested">Đã yêu cầu thanh toán</p>
          )}
        </>
      )}
    </div>
  )
}

export default OrderStatus
