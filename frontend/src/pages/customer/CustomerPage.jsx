import { useState, useCallback } from 'react'
import { apiClient } from '../../api/client'
import QRScanner from '../../components/customer/qr-scanner/QRScanner'
import Menu from '../../components/customer/menu/Menu'
import OrderStatus from '../../components/customer/order-status/OrderStatus'
import Cart from '../../components/customer/cart/Cart'
import './CustomerPage.css'

function parseTableCodeFromQRPayload(payload) {
  // PRD: QR có thể chứa URL ".../menu/{tableId}" hoặc chỉ raw code.
  // Backend hiện tại tìm theo Table.Code => giá trị cần pass vào /api/Customer/table/{code}.
  const raw = String(payload || '').trim()
  if (!raw) return raw
  try {
    const maybeUrl = raw.startsWith('http://') || raw.startsWith('https://') ? new URL(raw) : null
    if (maybeUrl) {
      const pathParts = maybeUrl.pathname.split('/').filter(Boolean)
      return pathParts[pathParts.length - 1] || ''
    }
  } catch {
    // ignore
  }
  // Fallback: split by '/', take last part (remove query)
  const parts = raw.split('/').filter(Boolean)
  const last = parts[parts.length - 1] || raw
  return String(last).split('?')[0]
}

const CustomerPage = () => {
  const [table, setTable] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)
  const [tableError, setTableError] = useState('')
  const [orderSent, setOrderSent] = useState(null) // { orderId, itemsSummary: [] }

  const resetCustomerSession = useCallback(() => {
    setOrderSent(null)
    setCartItems([])
    setShowMenu(false)
    setTable(null)
  }, [])

  const handleQRScanned = useCallback(async (scannedCode) => {
    setTableError('')
    setLoadingTable(true)
    try {
      const tableCode = parseTableCodeFromQRPayload(scannedCode)
      const { data } = await apiClient.get(`/api/Customer/table/${encodeURIComponent(tableCode)}`)
      setTable({ tableId: data.tableId, code: data.code, name: data.name })
      setShowMenu(true)
      setCartItems([])
      setOrderSent(null)
    } catch (err) {
      setTableError(err.response?.status === 404 ? 'Mã bàn không hợp lệ, vui lòng liên hệ nhân viên' : 'Lỗi kết nối. Thử lại.')
    } finally {
      setLoadingTable(false)
    }
  }, [])

  const addToCart = useCallback((item, quantity = 1) => {
    const id = item.menuItemId ?? item.id
    setCartItems((prev) => {
      const existing = prev.find((i) => (i.menuItemId ?? i.id) === id)
      if (existing) {
        return prev.map((i) => (i.menuItemId ?? i.id) === id ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { ...item, menuItemId: id, quantity, note: '' }]
    })
  }, [])

  const updateQuantity = useCallback((itemId, delta) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => (i.menuItemId ?? i.id) === itemId)
      if (!existing) return prev
      const next = existing.quantity + delta
      if (next <= 0) return prev.filter((i) => (i.menuItemId ?? i.id) !== itemId)
      return prev.map((i) => (i.menuItemId ?? i.id) === itemId ? { ...i, quantity: next } : i)
    })
  }, [])

  const updateNote = useCallback((itemId, noteValue) => {
    setCartItems((prev) =>
      prev.map((i) => (i.menuItemId ?? i.id) === itemId ? { ...i, note: noteValue } : i)
    )
  }, [])

  const submitOrder = useCallback(
    async (note) => {
      if (!table || cartItems.length === 0) return { success: false, message: 'Giỏ hàng trống' }
      try {
        const payload = {
          tableId: table.tableId,
          note: note || null,
          items: cartItems.map((i) => ({
            menuItemId: i.menuItemId ?? i.id,
            quantity: i.quantity,
            note: (i.note || null),
          })),
        }

        const currentOrderId = orderSent?.orderId ?? null
        console.log('[F1] Payload gui len:', JSON.stringify(payload, null, 2))
        console.log('[F1] order_id hien tai trong state/store:', currentOrderId)
        console.log('[F1] table_id:', table.tableId)

        const res = await apiClient.post('/api/Customer/order', payload)
        console.log('[F2] Response tu server:', JSON.stringify(res?.data ?? null, null, 2))

        const orderId = res?.data?.orderId
        setCartItems([])
        const nextOrderSent = {
          orderId: orderId ?? null,
          itemsSummary: cartItems.map((i) => ({
            name: i.name,
            quantity: i.quantity,
          })),
        }
        setOrderSent(nextOrderSent)
        console.log('[F2] State sau khi cap nhat:', JSON.stringify({
          cartItemsAfterSubmit: [],
          orderSentAfterSubmit: nextOrderSent,
        }, null, 2))
        return { success: true, orderId }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Gửi đơn thất bại' }
      }
    },
    [table, cartItems, orderSent]
  )

  if (!table || !showMenu) {
    return (
      <div className="customer-page">
        <div className="container">
          <h1>Quét QR Code để bắt đầu</h1>
          {tableError && <p className="table-error">{tableError}</p>}
          {loadingTable && <p>Đang xác nhận bàn...</p>}
          <QRScanner onScanned={handleQRScanned} />
        </div>
      </div>
    )
  }

  return (
    <div className="customer-page">
      <div className="container">
        <header className="header customer-header">
          <div>
            <h1>{table.name}</h1>
            <p className="customer-subtitle">Gọi món · Cập nhật trạng thái · Gửi yêu cầu chế biến</p>
          </div>
        </header>
        <div className="customer-content">
          <div className="menu-section">
            <Menu onAddToCart={addToCart} />
          </div>
          <div className="sidebar">
            {orderSent?.orderId && (
              <div className="order-sent">
                <h3>Đã gửi bếp</h3>
                <p>Order ID: #{orderSent.orderId}</p>
                <ul>
                  {orderSent.itemsSummary.map((it, idx) => (
                    <li key={`${it.name}-${idx}`}>
                      {it.quantity}x {it.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Cart
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onUpdateNote={updateNote}
              onSubmitOrder={submitOrder}
            />
            <OrderStatus tableId={table.tableId} onOrderCleared={resetCustomerSession} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerPage
