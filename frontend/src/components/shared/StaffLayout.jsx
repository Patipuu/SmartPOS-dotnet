import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './StaffLayout.css'

export default function StaffLayout({ title, children, roleLabel }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="staff-layout">
      <header className="staff-header">
        <div className="staff-header-left">
          <h1>{title}</h1>
          {roleLabel && <span className="role-badge">{roleLabel}</span>}
        </div>
        <div className="staff-header-right">
          <span className="staff-user">{user?.username}</span>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="staff-main">
        {children}
      </main>
    </div>
  )
}
