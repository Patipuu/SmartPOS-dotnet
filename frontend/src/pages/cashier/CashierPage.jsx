import { useState } from 'react'
import StaffLayout from '../../components/shared/StaffLayout'
import POSSession from '../../components/cashier/pos-session/POSSession'
import InvoiceList from '../../components/cashier/invoice-list/InvoiceList'
import './CashierPage.css'

const CashierPage = () => {
  const [sessionOpen, setSessionOpen] = useState(false)

  return (
    <StaffLayout title="Khu vực Thu ngân" roleLabel="Thu ngân">
      <div className="cashier-page">
        <div className="container cashier-container">
          <aside className="cashier-sidebar">
            <POSSession sessionOpen={sessionOpen} onSessionChange={setSessionOpen} />
          </aside>
          <section className="cashier-main">
            <p className="cashier-desc">
              Thanh toán hóa đơn · In / xuất hóa đơn · Đối chiếu tiền mặt
            </p>
            <InvoiceList />
          </section>
        </div>
      </div>
    </StaffLayout>
  )
}

export default CashierPage
