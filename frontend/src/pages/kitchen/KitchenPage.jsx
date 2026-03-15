import StaffLayout from '../../components/shared/StaffLayout'
import OrderList from '../../components/kitchen/order-list/OrderList'
import './KitchenPage.css'

const KitchenPage = () => {
  return (
    <StaffLayout title="Khu vực Bếp / Bar" roleLabel="Nhân viên bếp">
      <div className="kitchen-page">
        <div className="container">
          <p className="kitchen-desc">
            Xử lý KOT · Cập nhật trạng thái chế biến · Đồng bộ với phục vụ và thu ngân
          </p>
          <OrderList />
        </div>
      </div>
    </StaffLayout>
  )
}

export default KitchenPage
