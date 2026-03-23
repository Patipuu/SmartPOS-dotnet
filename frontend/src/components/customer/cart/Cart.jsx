import { useEffect, useMemo, useState, useCallback } from 'react'
import './Cart.css'

const Cart = ({ cartItems, onUpdateQuantity, onUpdateNote, onSubmitOrder }) => {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [debounceLocked, setDebounceLocked] = useState(false)

  const total = useMemo(() => {
    return (cartItems || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  }, [cartItems])

  const handleCheckout = useCallback(async () => {
    if (!cartItems?.length) return
    if (debounceLocked || submitting) return

    setSubmitting(true)
    setDebounceLocked(true)
    setMessage('')

    const result = await onSubmitOrder(note || null)

    // Debounce 2 giây để tránh double-submit
    setTimeout(() => setDebounceLocked(false), 2000)

    setSubmitting(false)
    if (result?.success) {
      setMessage('Đã gửi đơn thành công')
      setNote('')
    } else {
      setMessage(result?.message || 'Gửi đơn thất bại')
    }
  }, [cartItems?.length, debounceLocked, submitting, onSubmitOrder, note])

  useEffect(() => {
    if (!cartItems?.length) {
      setMessage('')
      setDebounceLocked(false)
    }
  }, [cartItems?.length])

  return (
    <div className="cart">
      <h2>Giỏ hàng</h2>
      {!cartItems?.length ? (
        <p className="empty-cart">Giỏ hàng trống</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => {
              const id = item.menuItemId ?? item.id
              return (
                <div key={id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">
                      {item.quantity} x {Number(item.price).toLocaleString('vi-VN')} đ
                    </span>

                    <div className="item-note-row">
                      <label className="item-note-label">Ghi chú</label>
                      <input
                        type="text"
                        value={item.note || ''}
                        placeholder="VD: ít đá, ít đường..."
                        onChange={(e) => onUpdateNote?.(id, e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button
                      type="button"
                      className="btn-quantity"
                      onClick={() => onUpdateQuantity?.(id, -1)}
                      disabled={submitting}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="btn-quantity"
                      onClick={() => onUpdateQuantity?.(id, 1)}
                      disabled={submitting}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="cart-total">
            <strong>Tổng cộng: {total.toLocaleString('vi-VN')} đ</strong>
          </div>
          {message && <p className="cart-message">{message}</p>}
          <button
            type="button"
            className="btn btn-success"
            onClick={handleCheckout}
            disabled={submitting || debounceLocked}
          >
            {submitting ? 'Đang gửi...' : debounceLocked ? 'Chờ 2 giây...' : 'Gửi đơn'}
          </button>
        </>
      )}
    </div>
  )
}

export default Cart
