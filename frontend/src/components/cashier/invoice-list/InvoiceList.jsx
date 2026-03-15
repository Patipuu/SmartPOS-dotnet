import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../../../api/client'
import InvoiceDetail from '../invoice-detail/InvoiceDetail'
import './InvoiceList.css'

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceDetail, setInvoiceDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creatingInvoice, setCreatingInvoice] = useState(null)

  const fetchInvoices = useCallback(() => {
    apiClient.get('/api/Cashier/invoices').then(({ data }) => setInvoices(Array.isArray(data) ? data : []))
  }, [])

  const fetchPending = useCallback(() => {
    apiClient.get('/api/Cashier/orders-pending').then(({ data }) => setPendingOrders(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/Cashier/invoices'),
      apiClient.get('/api/Cashier/orders-pending'),
    ])
      .then(([inv, pend]) => {
        setInvoices(Array.isArray(inv.data) ? inv.data : [])
        setPendingOrders(Array.isArray(pend.data) ? pend.data : [])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedInvoice?.id) {
      setInvoiceDetail(null)
      return
    }
    apiClient.get(`/api/Cashier/invoice/${selectedInvoice.id}`).then(({ data }) => setInvoiceDetail(data))
  }, [selectedInvoice?.id])

  const handleCreateInvoice = (orderId) => {
    setCreatingInvoice(orderId)
    apiClient
      .post('/api/Cashier/invoice', { orderId })
      .then(() => {
        fetchInvoices()
        fetchPending()
      })
      .finally(() => setCreatingInvoice(null))
  }

  const handlePaymentDone = () => {
    fetchInvoices()
    setSelectedInvoice(null)
    setInvoiceDetail(null)
  }

  if (loading) return <div className="invoice-list-page"><p>Đang tải...</p></div>

  return (
    <div className="invoice-list-page">
      <div className="invoice-list">
        {pendingOrders.length > 0 && (
          <section className="pending-orders">
            <h3>Đơn chờ thanh toán</h3>
            <div className="pending-list">
              {pendingOrders.map((o) => (
                <div key={o.id} className="pending-card">
                  <span>Đơn #{o.id} - {o.tableName}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleCreateInvoice(o.id)}
                    disabled={creatingInvoice === o.id}
                  >
                    {creatingInvoice === o.id ? 'Đang tạo...' : 'Tạo hóa đơn'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        <h2>Danh sách hóa đơn</h2>
        {invoices.length === 0 ? (
          <p className="no-invoices">Chưa có hóa đơn</p>
        ) : (
          <div className="invoices">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className={`invoice-card ${selectedInvoice?.id === inv.id ? 'selected' : ''}`}
                onClick={() => setSelectedInvoice(inv)}
              >
                <div className="invoice-header">
                  <span className="table-id">Đơn #{inv.orderId}</span>
                  <span className="invoice-total">
                    {Number(inv.totalAmount).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="invoice-status">
                  <span className={`status-badge status-${(inv.status || '').toLowerCase()}`}>
                    {inv.status === 'Unpaid' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {invoiceDetail && (
        <div className="invoice-detail-panel">
          <InvoiceDetail invoice={invoiceDetail} onPaymentDone={handlePaymentDone} />
        </div>
      )}
    </div>
  )
}

export default InvoiceList
