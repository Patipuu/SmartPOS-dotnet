import { useState, useEffect } from 'react'
import { apiClient } from '../../../api/client'
import { useOrderHubTable } from '../../../hooks/useOrderHub'
import './OrderStatus.css'

const OrderStatus = ({ tableId }) => {
  const [orderStatus, setOrderStatus] = useState(null)
  const [requestingPayment, setRequestingPayment] = useState(false)
  const { orderStatus: signalRStatus } = useOrderHubTable(tableId)

  const fetchStatus = () => {
    if (tableId == null) return
    apiClient
      .get('/api/Customer/order/status', { params: { tableId } })
      .then(({ data }) => setOrderStatus(data))
      .catch(() => setOrderStatus(null))
  }

  useEffect(() => {
    fetchStatus()
  }, [tableId])

  useEffect(() => {
    if (signalRStatus) setOrderStatus(signalRStatus)
  }, [signalRStatus])

  const handleRequestPayment = async () => {
    if (!orderStatus?.id) return
    setRequestingPayment(true)
    try {
      await apiClient.post(`/api/Customer/order/${orderStatus.id}/request-payment`)
      fetchStatus()
    } finally {
      setRequestingPayment(false)
    }
  }

  const getStatusText = (status) => {
    const map = { Pending: 'Đang chờ', Preparing: 'Đang chế biến', Ready: 'Sẵn sàng', Served: 'Đã phục vụ' }
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
              <div key={item.id} className="order-item">
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
          {orderStatus.id && !orderStatus.requestPayment && (
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
