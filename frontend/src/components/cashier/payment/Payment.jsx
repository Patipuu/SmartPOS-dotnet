import { useState } from 'react'
import { apiClient } from '../../../api/client'
import './Payment.css'

const Payment = ({ invoice, onPaymentDone }) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    if (!invoice?.id) return
    setLoading(true)
    setError('')
    try {
      await apiClient.post('/api/Cashier/payment', {
        invoiceId: invoice.id,
        paymentMethod,
      })
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
      </div>
      {error && <p className="payment-error">{error}</p>}
      <div className="payment-actions">
        <button
          type="button"
          className="btn btn-success"
          onClick={handlePayment}
          disabled={loading}
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
