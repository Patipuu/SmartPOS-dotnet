import { useState } from 'react'
import StaffLayout from '../../components/shared/StaffLayout'
import MenuManagement from '../../components/admin/menu-management/MenuManagement'
import CategoryManagement from '../../components/admin/category-management/CategoryManagement'
import RevenueReport from '../../components/admin/revenue-report/RevenueReport'
import OrderReport from '../../components/admin/order-report/OrderReport'
import UserManagement from '../../components/admin/user-management/UserManagement'
import InventoryPlaceholder from '../../components/admin/inventory-placeholder/InventoryPlaceholder'
import AlertsPlaceholder from '../../components/admin/alerts-placeholder/AlertsPlaceholder'
import './AdminPage.css'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('menu')

  const tabs = [
    { id: 'menu', label: 'Quản lý Món & Giá' },
    { id: 'category', label: 'Quản lý Danh mục' },
    { id: 'users', label: 'Người dùng & Phân quyền' },
    { id: 'inventory', label: 'Tồn kho & Công thức' },
    { id: 'revenue', label: 'Báo cáo Doanh thu' },
    { id: 'orders', label: 'Báo cáo Đơn hàng' },
    { id: 'alerts', label: 'Cảnh báo vận hành' },
  ]

  return (
    <StaffLayout title="Quản lý Nhà hàng" roleLabel="Quản lý">
      <div className="admin-page">
        <div className="container">
          <p className="admin-desc">
            Quản lý menu, giá, tồn kho, doanh thu, báo cáo lãi-lỗ, hiệu suất nhân viên, cảnh báo
          </p>
          <div className="admin-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="admin-content">
            {activeTab === 'menu' && <MenuManagement />}
            {activeTab === 'category' && <CategoryManagement />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'inventory' && <InventoryPlaceholder />}
            {activeTab === 'revenue' && <RevenueReport />}
            {activeTab === 'orders' && <OrderReport />}
            {activeTab === 'alerts' && <AlertsPlaceholder />}
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}

export default AdminPage
