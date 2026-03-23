import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getCurrentSession, openSession, closeSession, getTerminals } from '../../../services/cashierService'
import './POSSession.css'

const POSSession = ({ sessionOpen, onSessionChange }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [session, setSession] = useState(null) // { sessionId, openTime, openCash }
  const [terminals, setTerminals] = useState([])
  const [openCashInput, setOpenCashInput] = useState('')
  const [terminalId, setTerminalId] = useState(1)
  const [closeCashInput, setCloseCashInput] = useState('')
  const [closeNote, setCloseNote] = useState('')
  const [closeError, setCloseError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openCash = session?.openCash ?? 0

  const cashDiff = useMemo(() => {
    const open = Number(openCash || 0)
    const actual = Number(closeCashInput)
    if (!Number.isFinite(actual)) return null
    return actual - open
  }, [closeCashInput, openCash])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    Promise.all([getCurrentSession(), getTerminals()])
      .then(([sess, terms]) => {
        if (!mounted) return
        setSession(sess)
        onSessionChange?.(!!sess)
        setTerminals(Array.isArray(terms) ? terms : [])
        if (terms?.length) setTerminalId(terms[0].terminalId)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err.response?.data?.message || 'Lỗi tải dữ liệu')
        setSession(null)
        onSessionChange?.(false)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [onSessionChange])

  const handleOpenShift = async () => {
    const value = Number(openCashInput)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Vui lòng nhập tiền đầu ca hợp lệ (> 0)')
      return
    }
    setError('')
    setSaving(true)
    try {
      await openSession({ openCash: value, terminalId })
      const sess = await getCurrentSession()
      setSession(sess)
      onSessionChange?.(!!sess)
      setOpenCashInput('')
    } catch (err) {
      setError(err.response?.data?.message || 'Mở ca thất bại')
      if (err.response?.status === 409) setError('Đã có ca đang mở')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseShift = async () => {
    const actual = Number(closeCashInput)
    if (!Number.isFinite(actual) || actual < 0) {
      setCloseError('Vui lòng nhập tiền thực tế hợp lệ (>= 0).')
      return
    }
    const diff = actual - openCash
    if (diff !== 0 && !String(closeNote || '').trim()) {
      setCloseError('Chênh lệch != 0 → bắt buộc nhập ghi chú lý do trước khi chốt ca.')
      return
    }
    setCloseError('')
    setSaving(true)
    try {
      await closeSession({ closeCash: actual, closeNote: closeNote || null })
      onSessionChange?.(false)
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setCloseError(err.response?.data?.message || 'Đóng ca thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="pos-session"><p>Đang tải...</p></div>

  return (
    <div className="pos-session">
      <h3>Ca làm việc POS</h3>
      {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem', marginBottom: 8 }}>{error}</p>}
      {!sessionOpen ? (
        <div className="session-closed">
          <p>Chưa mở ca</p>
          {terminals.length > 0 && (
            <div className="form-group">
              <label>Quầy</label>
              <select value={terminalId} onChange={(e) => setTerminalId(Number(e.target.value))} disabled={saving}>
                {terminals.map((t) => (
                  <option key={t.terminalId} value={t.terminalId}>{t.location}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Tiền đầu ca</label>
            <input
              type="number"
              placeholder="Ví dụ: 500000"
              value={openCashInput}
              onChange={(e) => setOpenCashInput(e.target.value)}
              className="input-cash"
              disabled={saving}
            />
          </div>
          <button type="button" className="btn btn-success btn-block" onClick={handleOpenShift} disabled={saving}>
            Mở ca
          </button>
        </div>
      ) : (
        <div className="session-open">
          <p className="session-time">
            <strong>Mở ca:</strong> {session?.openTime ? new Date(session.openTime).toLocaleString('vi-VN') : '-'}
          </p>
          <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem' }}>
            <strong>Tiền đầu ca:</strong> {openCash ? Number(openCash).toLocaleString('vi-VN') : '-'} đ
          </p>

          <div className="form-group">
            <label>Tiền thực tế (đối chiếu)</label>
            <input
              type="number"
              placeholder="Nhập số tiền thực tế"
              value={closeCashInput}
              onChange={(e) => setCloseCashInput(e.target.value)}
              className="input-cash"
              disabled={saving}
            />
          </div>

          <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '0.95rem' }}>
            {cashDiff == null ? '-' : cashDiff === 0 ? 'Chênh lệch: 0' : cashDiff > 0 ? <>Chênh lệch: Thừa {Number(cashDiff).toLocaleString('vi-VN')} đ</> : <>Chênh lệch: Thiếu {Math.abs(Number(cashDiff)).toLocaleString('vi-VN')} đ</>}
          </p>

          {cashDiff != null && cashDiff !== 0 && (
            <div className="form-group">
              <label>Ghi chú lý do chênh lệch</label>
              <input
                type="text"
                placeholder="Bắt buộc nhập khi chênh lệch != 0"
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                className="input-cash"
                disabled={saving}
              />
            </div>
          )}

          {closeError && <p style={{ color: '#e74c3c', marginTop: -6 }}>{closeError}</p>}

          <button type="button" className="btn btn-outline-danger btn-block" onClick={handleCloseShift} disabled={saving}>
            Đóng ca
          </button>
        </div>
      )}
    </div>
  )
}

export default POSSession
