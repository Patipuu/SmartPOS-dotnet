import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ChangePasswordModal from '../ChangePasswordModal'
import './StaffLayout.css'

export default function StaffLayout({ title, children, roleLabel }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleLogout = () => {
    setShowDropdown(false)
    logout()
    navigate('/login')
  }

  const displayName = user?.username ?? ''

  return (
    <div className="staff-layout">
      <header className="staff-header">
        <div className="staff-header-left">
          <h1>{title}</h1>
          {roleLabel && <span className="role-badge">{roleLabel}</span>}
        </div>
        <div className="staff-header-right" ref={dropdownRef}>
          <div
            className="staff-user-dropdown-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
            onKeyDown={(e) => e.key === 'Enter' && setShowDropdown(!showDropdown)}
            role="button"
            tabIndex={0}
          >
            <span className="staff-user">{displayName}</span>
            <span className="staff-dropdown-arrow">▼</span>
          </div>
          {showDropdown && (
            <div className="staff-user-dropdown">
              <button type="button" className="staff-dropdown-item" onClick={() => { setShowDropdown(false); setShowChangePassword(true) }}>
                Đổi mật khẩu
              </button>
              <button type="button" className="staff-dropdown-item" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="staff-main">
        {children}
      </main>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  )
}
