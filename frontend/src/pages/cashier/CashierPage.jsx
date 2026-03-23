import { useCallback, useEffect, useState } from 'react'
import { getCashierTables } from '../../services/tablesService'
import { useOrderHubCashier } from '../../hooks/useOrderHub'
import StaffLayout from '../../components/shared/StaffLayout'
import POSSession from '../../components/cashier/pos-session/POSSession'
import InvoiceList from '../../components/cashier/invoice-list/InvoiceList'
import TableGrid from '../../components/cashier/table-grid/TableGrid'
import './CashierPage.css'

const CashierPage = () => {
  const [sessionOpen, setSessionOpen] = useState(false)
  const [tables, setTables] = useState([])
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [gridLoading, setGridLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [paymentProcessedTick, setPaymentProcessedTick] = useState(0)

  const refreshTables = useCallback(async () => {
    if (!hasLoadedOnce) setGridLoading(true)
    try {
      const list = await getCashierTables()
      const nextTables = list.map((t) => ({
        tableId: t.tableId,
        tableName: t.tableName || t.name || `Bàn ${t.tableId}`,
        status: t.status || 'AVAILABLE',
      }))
      setTables(nextTables)
      setSelectedTableId((prev) => {
        if (prev != null && nextTables.some((x) => x.tableId === prev)) return prev
        return nextTables.length ? nextTables[0].tableId : null
      })
    } catch {
      setTables([])
      setSelectedTableId(null)
    } finally {
      setGridLoading(false)
      setHasLoadedOnce(true)
    }
  }, [hasLoadedOnce])

  const onPaymentProcessed = useCallback(() => {
    refreshTables()
    setPaymentProcessedTick((t) => t + 1)
  }, [refreshTables])
  useOrderHubCashier(onPaymentProcessed)

  useEffect(() => {
    refreshTables()
    const id = setInterval(refreshTables, 4000)
    return () => clearInterval(id)
  }, [refreshTables])

  const handleNeedOpenShift = () => {
    const el = document.getElementById('pos-session')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <StaffLayout title="Khu vực Thu ngân" roleLabel="Thu ngân">
      <div className="cashier-page">
        <div className="container cashier-container">
          <aside className="cashier-sidebar">
            <div id="pos-session">
              <POSSession sessionOpen={sessionOpen} onSessionChange={setSessionOpen} />
            </div>
          </aside>
          <section className="cashier-main">
            <p className="cashier-desc">
              Thanh toán hóa đơn · In / xuất hóa đơn · Đối chiếu tiền mặt
            </p>

            <TableGrid
              tables={tables}
              selectedTableId={selectedTableId}
              onSelectTableId={setSelectedTableId}
              loading={gridLoading}
            />

            <div style={{ marginTop: 20 }}>
              <InvoiceList
                selectedTableId={selectedTableId}
                sessionOpen={sessionOpen}
                onNeedOpenShift={handleNeedOpenShift}
                paymentProcessedTick={paymentProcessedTick}
              />
            </div>
          </section>
        </div>
      </div>
    </StaffLayout>
  )
}

export default CashierPage
