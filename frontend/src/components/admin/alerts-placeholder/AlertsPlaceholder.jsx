import './AlertsPlaceholder.css'

const AlertsPlaceholder = () => {
  return (
    <div className="alerts-placeholder">
      <h2>Cảnh báo vận hành</h2>
      <p className="placeholder-note">
        Khi backend có Checklist, Operational_Alert và API, hiển thị cảnh báo tại đây.
      </p>
      <ul>
        <li>Cảnh báo dựa trên checklist</li>
        <li>Cảnh báo theo đơn hàng (trễ, hủy, v.v.)</li>
      </ul>
    </div>
  )
}

export default AlertsPlaceholder
