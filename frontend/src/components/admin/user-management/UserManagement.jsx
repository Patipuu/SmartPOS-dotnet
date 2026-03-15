import './UserManagement.css'

const UserManagement = () => {

  return (
    <div className="user-management">
      <h2>Quản lý người dùng và phân quyền</h2>
      <p className="placeholder-note">
        API danh sách người dùng chưa có. Khi backend bổ sung endpoint GET/POST/PUT /api/Admin/users và roles, kết nối tại đây.
      </p>
      <div className="user-list-placeholder">
        <p>Vai trò: Admin, Thu ngân, Nhân viên bếp, Nhân viên phục vụ.</p>
        <p>Chức năng: Thêm/sửa/xóa user, gán vai trò.</p>
      </div>
    </div>
  )
}

export default UserManagement
