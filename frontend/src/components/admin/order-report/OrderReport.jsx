import { useState, useEffect } from 'react'
import { apiClient } from '../../../api/client'
import './OrderReport.css'

const OrderReport = () => {
  const [orders, setOrders] = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get('/api/Admin/orders/report')
      .then(({ data }) => {
        setOrders(data?.orders ?? [])
        setTopSellers(data?.topSellers ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="order-report"><p>Đang tải...</p></div>

  return (
    <div className="order-report">
      <h2>Báo cáo Đơn hàng</h2>

      <div className="report-section">
        <h3>Món bán chạy</h3>
        <div className="top-items">
          {topSellers.map((item, index) => (
            <div key={index} className="top-item">
              <span className="rank">#{index + 1}</span>
              <span className="item-name">{item.itemName}</span>
              <span className="item-orders">{item.quantitySold} lượng bán</span>
            </div>
          ))}
        </div>
      </div>

      <div className="report-section">
        <h3>Đơn hàng gần đây</h3>
        <table>
          <thead>
            <tr>
              <th>Đơn</th>
              <th>Bàn</th>
              <th>Tổng</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId}>
                <td>#{o.orderId}</td>
                <td>{o.tableId}</td>
                <td>{Number(o.total).toLocaleString('vi-VN')} đ</td>
                <td>{o.createdTime ? new Date(o.createdTime).toLocaleString('vi-VN') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderReport
