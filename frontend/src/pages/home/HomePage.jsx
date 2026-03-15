import { Link } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Smart POS</h1>
        <p className="home-subtitle">Chọn vai trò để vào màn hình tương ứng</p>
        <div className="role-cards">
          <Link to="/customer" className="role-card customer">
            <span className="role-icon">📱</span>
            <h2>Khách hàng</h2>
            <p>Gọi món, cập nhật trạng thái bàn, gửi yêu cầu chế biến</p>
          </Link>
          <Link to="/kitchen" className="role-card kitchen">
            <span className="role-icon">👨‍🍳</span>
            <h2>Nhân viên bếp</h2>
            <p>Xử lý KOT, cập nhật trạng thái chế biến, đồng bộ với phục vụ và thu ngân</p>
          </Link>
          <Link to="/cashier" className="role-card cashier">
            <span className="role-icon">💰</span>
            <h2>Thu ngân</h2>
            <p>Mở/đóng ca POS, thanh toán hóa đơn, in hóa đơn, đối chiếu tiền mặt</p>
          </Link>
          <Link to="/admin" className="role-card admin">
            <span className="role-icon">⚙️</span>
            <h2>Quản lý</h2>
            <p>Menu, giá, tồn kho, doanh thu, báo cáo, phân quyền, cảnh báo</p>
          </Link>
        </div>
        <p className="home-note">Thu ngân và Quản lý cần đăng nhập. Bếp có thể yêu cầu đăng nhập tùy cấu hình.</p>
      </div>
    </div>
  )
}

export default HomePage
