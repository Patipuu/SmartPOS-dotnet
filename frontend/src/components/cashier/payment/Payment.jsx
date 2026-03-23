import { useMemo, useState } from 'react'
import { apiClient } from '../../../api/client'
import './Payment.css'

const Payment = ({ invoice, onPaymentDone, sessionOpen, onNeedOpenShift }) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash') // Cash/Card/QR
  const [cashGiven, setCashGiven] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const totalAmount = Number(invoice?.totalAmount || 0)
  const change = useMemo(() => {
    const given = Number(cashGiven || 0)
    if (!Number.isFinite(given)) return 0
    return given - totalAmount
  }, [cashGiven, totalAmount])

  const handlePayment = async () => {
    if (!invoice?.invoiceId) return

    setError('')
    setSuccessMsg('')

    if (!sessionOpen) {
      setError('Chưa mở ca làm việc')
      onNeedOpenShift?.()
      return
    }

    if (paymentMethod === 'Cash') {
      const given = Number(cashGiven || 0)
      if (!Number.isFinite(given) || given <= 0) {
        setError('Vui lòng nhập tiền khách đưa (tiền mặt)')
        return
      }
      if (given < totalAmount) {
        setError('Tiền khách đưa chưa đủ')
        return
      }
    }

    setLoading(true)
    try {
      await apiClient.post('/api/Cashier/payment', {
        invoiceId: invoice.invoiceId,
        paymentMethod: paymentMethod,
      })
      setSuccessMsg(
        paymentMethod === 'Cash'
          ? `Thanh toán thành công. Tiền thối: ${change.toLocaleString('vi-VN')} đ`
          : 'Thanh toán thành công.'
      )
      onPaymentDone?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Thanh toán thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  return (
    <div className="payment">
      <h3>Thanh toán</h3>

      {!sessionOpen && (
        <div className="payment-session-guard" style={{ marginBottom: 10 }}>
          <p className="payment-error" style={{ margin: 0 }}>
            Chưa mở ca làm việc. Vui lòng mở ca để thanh toán.
          </p>
          <button type="button" className="btn btn-primary" onClick={onNeedOpenShift}>
            Mở ca ngay
          </button>
        </div>
      )}

      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="Cash"
            checked={paymentMethod === 'Cash'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Tiền mặt
        </label>
        <label>
          <input
            type="radio"
            value="Card"
            checked={paymentMethod === 'Card'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Thẻ
        </label>
        <label>
          <input
            type="radio"
            value="QR"
            checked={paymentMethod === 'QR'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={!sessionOpen}
          />
          QR
        </label>
      </div>

      {paymentMethod === 'Cash' && (
        <div style={{ marginTop: 10 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Tiền khách đưa</label>
          <input
            type="number"
            value={cashGiven}
            onChange={(e) => setCashGiven(e.target.value)}
            disabled={!sessionOpen || loading}
            placeholder="Ví dụ: 200000"
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
          />
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            Tiền thối: <strong>{change.toLocaleString('vi-VN')} đ</strong>
          </p>
        </div>
      )}

      {error && <p className="payment-error">{error}</p>}
      {successMsg && <p style={{ color: '#27ae60', fontWeight: 600 }}>{successMsg}</p>}
      <div className="payment-actions">
        <button
          type="button"
          className="btn btn-success"
          onClick={handlePayment}
          disabled={loading || !invoice?.invoiceId}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
        </button>
        <button type="button" className="btn btn-primary" onClick={handlePrintInvoice}>
          In hóa đơn
        </button>
      </div>
    </div>
  )
}

export default Payment
