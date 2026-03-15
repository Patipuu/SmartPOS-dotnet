import { useState, useEffect } from 'react'
import { apiClient } from '../../../api/client'
import './RevenueReport.css'

const RevenueReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiClient
      .get('/api/Admin/revenue', { params: { period: selectedPeriod } })
      .then(({ data: res }) => setData(res))
      .finally(() => setLoading(false))
  }, [selectedPeriod])

  if (loading) return <div className="revenue-report"><p>Đang tải...</p></div>

  const totalRevenue = data?.totalRevenue ?? 0
  const orderCount = data?.orderCount ?? 0

  return (
    <div className="revenue-report">
      <div className="report-header">
        <h2>Báo cáo Doanh thu</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="period-select"
        >
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Tổng doanh thu</h3>
          <p className="amount">{Number(totalRevenue).toLocaleString('vi-VN')} đ</p>
        </div>
        <div className="summary-card">
          <h3>Tổng đơn hàng</h3>
          <p className="amount">{orderCount}</p>
        </div>
        <div className="summary-card">
          <h3>Trung bình/đơn</h3>
          <p className="amount">
            {orderCount > 0 ? (Number(totalRevenue) / orderCount).toLocaleString('vi-VN') : 0} đ
          </p>
        </div>
      </div>
    </div>
  )
}

export default RevenueReport
