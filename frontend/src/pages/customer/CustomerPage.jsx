import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../../api/client'
import QRScanner from '../../components/customer/qr-scanner/QRScanner'
import Menu from '../../components/customer/menu/Menu'
import OrderStatus from '../../components/customer/order-status/OrderStatus'
import Cart from '../../components/customer/cart/Cart'
import './CustomerPage.css'

const CustomerPage = () => {
  const [table, setTable] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)
  const [tableError, setTableError] = useState('')

  const handleQRScanned = useCallback(async (scannedCode) => {
    setTableError('')
    setLoadingTable(true)
    try {
      const { data } = await apiClient.get(`/api/Customer/table/${encodeURIComponent(scannedCode)}`)
      setTable({ tableId: data.tableId, code: data.code, name: data.name })
      setShowMenu(true)
    } catch (err) {
      setTableError(err.response?.status === 404 ? 'Không tìm thấy bàn' : 'Lỗi kết nối. Thử lại.')
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
      return [...prev, { ...item, menuItemId: id, quantity }]
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

  const submitOrder = useCallback(
    async (note) => {
      if (!table || cartItems.length === 0) return { success: false, message: 'Giỏ hàng trống' }
      try {
        await apiClient.post('/api/Customer/order', {
          tableId: table.tableId,
          note: note || null,
          items: cartItems.map((i) => ({ menuItemId: i.menuItemId ?? i.id, quantity: i.quantity, note: null })),
        })
        setCartItems([])
        return { success: true }
      } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Gửi đơn thất bại' }
      }
    },
    [table, cartItems]
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
            <Menu tableId={table.tableId} onAddToCart={addToCart} />
          </div>
          <div className="sidebar">
            <Cart
              tableId={table.tableId}
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onSubmitOrder={submitOrder}
            />
            <OrderStatus tableId={table.tableId} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerPage
