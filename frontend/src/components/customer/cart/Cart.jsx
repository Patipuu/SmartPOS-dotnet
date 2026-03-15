import { useState } from 'react'
import './Cart.css'

const Cart = ({ tableId, cartItems, onUpdateQuantity, onSubmitOrder }) => {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const total = (cartItems || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)

  const handleCheckout = async () => {
    if (!cartItems?.length) return
    setSubmitting(true)
    setMessage('')
    const result = await onSubmitOrder(note || null)
    setSubmitting(false)
    if (result.success) {
      setMessage('Đã gửi đơn thành công')
      setNote('')
    } else {
      setMessage(result.message || 'Gửi đơn thất bại')
    }
  }

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
                  </div>
                  <div className="cart-item-actions">
                    <button
                      type="button"
                      className="btn-quantity"
                      onClick={() => onUpdateQuantity?.(id, -1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="btn-quantity"
                      onClick={() => onUpdateQuantity?.(id, 1)}
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
            disabled={submitting}
          >
            {submitting ? 'Đang gửi...' : 'Gửi đơn'}
          </button>
        </>
      )}
    </div>
  )
}

export default Cart
