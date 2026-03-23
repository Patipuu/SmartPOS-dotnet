import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../../../api/client'
import './RevenueReport.css'

function buildMockTrend(totalRevenue, points = 7) {
  const n = Number(points)
  const total = Number(totalRevenue)
  if (!Number.isFinite(total) || n <= 0) return []

  const base = total / n
  return Array.from({ length: n }).map((_, idx) => {
    const wiggle = 1 + (idx % 3) * 0.08 // deterministic
    return Math.max(0, base * wiggle)
  })
}

function downloadCSV(filename, rows) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

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

  const totalRevenue = data?.totalRevenue ?? 0
  const orderCount = data?.orderCount ?? 0
  const hasData = Number(orderCount) > 0 || Number(totalRevenue) > 0

  const trend = useMemo(
    () => buildMockTrend(totalRevenue, selectedPeriod === 'today' ? 7 : selectedPeriod === 'week' ? 7 : 10),
    [totalRevenue, selectedPeriod]
  )

  const handleExport = () => {
    const rows = [
      ['period', selectedPeriod],
      ['totalRevenue', totalRevenue],
      ['orderCount', orderCount],
      [],
      ['trend', ...trend.map((v) => v.toFixed(2))],
    ]
    downloadCSV(`revenue_${selectedPeriod}.csv`, rows)
  }

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

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleExport}
          disabled={!hasData}
          style={{ marginLeft: 12 }}
        >
          Export CSV
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : !hasData ? (
        <p className="empty-report">Không có dữ liệu</p>
      ) : (
        <>
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

          <div className="chart-section">
            <h3>Biểu đồ xu hướng (mock)</h3>
            <div className="trend-bars">
              {trend.map((v, idx) => {
                const max = Math.max(...trend, 1)
                const h = (v / max) * 100
                return (
                  <div
                    key={idx}
                    className="trend-bar"
                    style={{ height: `${h}%` }}
                    title={v.toFixed(0)}
                  />
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RevenueReport
