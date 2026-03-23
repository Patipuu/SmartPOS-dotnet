import './TableGrid.css'

const statusLabel = {
  PAYMENT_PENDING: 'Chờ thanh toán',
  SERVING: 'Đang phục vụ',
  AVAILABLE: 'Trống',
}

export default function TableGrid({ tables, selectedTableId, onSelectTableId, loading }) {
  if (loading) return <div className="table-grid"><p>Đang tải sơ đồ bàn...</p></div>
  if (!Array.isArray(tables) || tables.length === 0) return <div className="table-grid"><p>Chưa có dữ liệu bàn</p></div>

  return (
    <div className="table-grid">
      <h3>Sơ đồ bàn</h3>

      <div className="table-grid-cards">
        {tables.map((t) => {
          const selected = selectedTableId === t.tableId
          const status = t.status || 'AVAILABLE'

          const cls = status === 'PAYMENT_PENDING'
            ? 'table-status-red'
            : status === 'SERVING'
              ? 'table-status-yellow'
              : 'table-status-blue'

          return (
            <button
              key={t.tableId}
              type="button"
              className={`table-card ${cls} ${selected ? 'selected' : ''}`}
              onClick={() => onSelectTableId?.(t.tableId)}
            >
              <div className="table-card-title">{t.tableName || `Bàn ${t.tableId}`}</div>
              <div className="table-card-status">{statusLabel[status] || 'Trống'}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

