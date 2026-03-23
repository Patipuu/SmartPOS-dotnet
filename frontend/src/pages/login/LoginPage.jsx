import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './LoginPage.css'

function mapBackendErrorToPRD(message) {
  const msg = String(message || '').toLowerCase()

  // Backend hiện tại đang trả "Invalid username or password" cho cả trường hợp sai hoặc bị khóa.
  // Mapping theo PRD: sai mật khẩu -> "Tài khoản hoặc mật khẩu không chính xác"
  if (msg.includes('invalid') || msg.includes('username') || msg.includes('password')) {
    return 'Tài khoản hoặc mật khẩu không chính xác'
  }
  if (msg.includes('lock') || msg.includes('khóa') || msg.includes('bị khóa')) {
    return 'Tài khoản bị khóa, liên hệ quản lý'
  }
  return message || 'Đăng nhập thất bại'
}

function roleToPath(role) {
  switch (role) {
    case 'Admin':
      return '/admin'
    case 'Cashier':
      return '/cashier'
    case 'Kitchen':
      return '/kitchen'
    case 'Staff':
    default:
      return '/customer'
  }
}

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(username, password)
    if (result.success) {
      const next = roleToPath(result.role)
      // Ưu tiên redirect theo role; fallback về route trước đó nếu role không xác định
      navigate(next || from || '/admin', { replace: true })
    } else {
      setError(mapBackendErrorToPRD(result.message || 'Đăng nhập thất bại'))
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Đăng nhập</h1>
          <form onSubmit={handleSubmit}>
            {error && <p className="login-error">{error}</p>}
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
