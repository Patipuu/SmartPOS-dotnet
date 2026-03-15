import { useState } from 'react'
import './POSSession.css'

const POSSession = ({ sessionOpen, onSessionChange }) => {
  const [openTime, setOpenTime] = useState(null)
  const [closeTime, setCloseTime] = useState(null)
  const [cashDifference, setCashDifference] = useState('')

  const handleOpenShift = () => {
    setOpenTime(new Date().toISOString())
    onSessionChange?.(true)
  }

  const handleCloseShift = () => {
    setCloseTime(new Date().toISOString())
    onSessionChange?.(false)
  }

  return (
    <div className="pos-session">
      <h3>Ca làm việc POS</h3>
      {!sessionOpen ? (
        <div className="session-closed">
          <p>Chưa mở ca</p>
          <button type="button" className="btn btn-success btn-block" onClick={handleOpenShift}>
            Mở ca
          </button>
        </div>
      ) : (
        <div className="session-open">
          <p className="session-time">
            <strong>Mở ca:</strong> {openTime ? new Date(openTime).toLocaleString('vi-VN') : '-'}
          </p>
          <div className="form-group">
            <label>Chênh lệch tiền mặt (đối chiếu)</label>
            <input
              type="number"
              placeholder="0"
              value={cashDifference}
              onChange={(e) => setCashDifference(e.target.value)}
              className="input-cash"
            />
          </div>
          <button type="button" className="btn btn-outline-danger btn-block" onClick={handleCloseShift}>
            Đóng ca
          </button>
        </div>
      )}
    </div>
  )
}

export default POSSession
