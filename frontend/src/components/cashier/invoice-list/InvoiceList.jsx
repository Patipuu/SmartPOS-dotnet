import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../../../api/client'
import InvoiceDetail from '../invoice-detail/InvoiceDetail'
import './InvoiceList.css'

const InvoiceList = ({ selectedTableId, sessionOpen, onNeedOpenShift, paymentProcessedTick }) => {
  const [invoices, setInvoices] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceDetail, setInvoiceDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creatingInvoice, setCreatingInvoice] = useState(null)
  const [createInvoiceError, setCreateInvoiceError] = useState('')

  const fetchInvoices = useCallback(async () => {
    const { data } = await apiClient.get('/api/Cashier/invoices')
    setInvoices(Array.isArray(data) ? data : [])
  }, [])

  const fetchPending = useCallback(async () => {
    const { data } = await apiClient.get('/api/Cashier/orders-pending')
    setPendingOrders(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    let mounted = true

    Promise.all([fetchInvoices(), fetchPending()]).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [fetchInvoices, fetchPending])

  // Poll pending orders to reflect "yêu cầu thanh toán" without F5.
  useEffect(() => {
    const id = setInterval(() => {
      fetchPending()
      fetchInvoices()
    }, 5000)

    return () => clearInterval(id)
  }, [fetchInvoices, fetchPending])

  // Real-time refresh khi thanh toán xong (SignalR PaymentProcessed)
  useEffect(() => {
    if (paymentProcessedTick > 0) {
      fetchPending()
      fetchInvoices()
    }
  }, [paymentProcessedTick, fetchInvoices, fetchPending])

  useEffect(() => {
    setSelectedInvoice(null)
    setInvoiceDetail(null)
  }, [selectedTableId])

  useEffect(() => {
    if (!selectedInvoice?.invoiceId) {
      setInvoiceDetail(null)
      return
    }

    apiClient
      .get(`/api/Cashier/invoice/${selectedInvoice.invoiceId}`)
      .then(({ data }) => setInvoiceDetail(data))
      .catch(() => setInvoiceDetail(null))
  }, [selectedInvoice?.invoiceId])

  const pendingForTable = useMemo(() => {
    if (selectedTableId == null) return pendingOrders
    return pendingOrders.filter((o) => o.tableId === selectedTableId)
  }, [pendingOrders, selectedTableId])

  const invoicesForTable = useMemo(() => {
    if (selectedTableId == null) return invoices
    // Backend invoice list doesn't include tableId; derive by matching orderId in pending orders (assumption)
    // In POC, selectedTableId always comes from pending/kitchen, so showing all invoices is acceptable fallback.
    return invoices
  }, [invoices, selectedTableId])

  const handleCreateInvoice = async (orderId) => {
    setCreatingInvoice(orderId)
    setCreateInvoiceError('')

    try {
      await apiClient.post('/api/Cashier/invoice', { orderId })

      // Reload and auto-select the newly created invoice so Payment appears immediately.
      const [invRes, pendRes] = await Promise.all([
        apiClient.get('/api/Cashier/invoices'),
        apiClient.get('/api/Cashier/orders-pending'),
      ])

      const nextInvoices = Array.isArray(invRes.data) ? invRes.data : []
      const nextPending = Array.isArray(pendRes.data) ? pendRes.data : []

      setInvoices(nextInvoices)
      setPendingOrders(nextPending)

      const newInvoice = nextInvoices.find((x) => Number(x.orderId) === Number(orderId)) ?? null
      setSelectedInvoice(newInvoice)
      setInvoiceDetail(null)
    } catch (err) {
      setCreateInvoiceError(err?.response?.data?.message || 'Tạo hóa đơn thất bại')
    } finally {
      setCreatingInvoice(null)
    }
  }

  const handlePaymentDone = async () => {
    await Promise.all([fetchInvoices(), fetchPending()])
    setSelectedInvoice(null)
    setInvoiceDetail(null)
  }

  if (loading) return <div className="invoice-list-page"><p>Đang tải...</p></div>

  return (
    <div className="invoice-list-page">
      <div className="invoice-list">
        {pendingForTable.length > 0 && (
          <section className="pending-orders">
            <h3>Đơn chờ thanh toán</h3>
            <div className="pending-list">
              {pendingForTable.map((o) => (
                <div key={o.id} className="pending-card">
                  <span>Đơn #{o.id} - {o.tableName}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleCreateInvoice(o.orderId ?? o.id)}
                    disabled={creatingInvoice === (o.orderId ?? o.id)}
                  >
                    {creatingInvoice === (o.orderId ?? o.id) ? 'Đang tạo...' : 'Tạo hóa đơn'}
                  </button>
                </div>
              ))}
            </div>

            {createInvoiceError && (
              <p style={{ color: '#e74c3c', marginTop: 10 }}>{createInvoiceError}</p>
            )}
          </section>
        )}

        <h2>Danh sách hóa đơn</h2>

        {invoicesForTable.length === 0 ? (
          <p className="no-invoices">Chưa có hóa đơn</p>
        ) : (
          <div className="invoices">
            {invoicesForTable.map((inv) => (
              <div
                key={inv.invoiceId}
                className={`invoice-card ${selectedInvoice?.invoiceId === inv.invoiceId ? 'selected' : ''}`}
                onClick={() => setSelectedInvoice(inv)}
              >
                <div className="invoice-header">
                  <span className="table-id">Đơn #{inv.orderId}</span>
                  <span className="invoice-total">
                    {Number(inv.totalAmount).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="invoice-status">
                  <span
                    className={`status-badge ${String(inv.status) === 'Unpaid' ? 'status-pending' : 'status-paid'}`}
                  >
                    {String(inv.status) === 'Unpaid' ? 'Chờ thanh toán' : 'Đã thanh toán'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {invoiceDetail && (
        <div className="invoice-detail-panel">
          <InvoiceDetail
            invoice={invoiceDetail}
            onPaymentDone={handlePaymentDone}
            sessionOpen={sessionOpen}
            onNeedOpenShift={onNeedOpenShift}
          />
        </div>
      )}
    </div>
  )
}

export default InvoiceList
