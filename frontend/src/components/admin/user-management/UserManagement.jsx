import { useCallback, useEffect, useState } from 'react'
import * as userService from '../../../services/userService'
import './UserManagement.css'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', displayName: '', roleId: '' })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [u, r] = await Promise.all([userService.getUsers(), userService.getRoles()])
      setUsers(Array.isArray(u) ? u : [])
      setRoles(Array.isArray(r) ? r : [])
      if (r?.length && !form.roleId) setForm((f) => ({ ...f, roleId: r[0].roleId }))
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filteredUsers = users.filter((u) => {
    if (search && !u.username?.toLowerCase().includes(search.toLowerCase()) && !u.displayName?.toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter && u.roleId !== Number(roleFilter)) return false
    return true
  })

  const handleOpenCreate = () => {
    setEditingUser(null)
    setForm({ username: '', password: '', displayName: '', roleId: roles[0]?.roleId ?? '' })
    setShowModal(true)
    setError('')
  }

  const handleOpenEdit = (u) => {
    setEditingUser(u)
    setForm({ username: u.username, password: '', displayName: u.displayName || '', roleId: u.roleId, isActive: u.isActive })
    setShowModal(true)
    setError('')
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.userId, {
          displayName: form.displayName || null,
          roleId: form.roleId ? Number(form.roleId) : undefined,
          isActive: form.isActive,
        })
      } else {
        if (!form.username?.trim()) { setError('Username không được trống'); return }
        if (!form.password || form.password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự'); return }
        await userService.createUser({
          username: form.username.trim(),
          password: form.password,
          displayName: form.displayName?.trim() || null,
          roleId: Number(form.roleId),
        })
      }
      setShowModal(false)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (u) => {
    if (!window.confirm(`Vô hiệu hóa tài khoản ${u.username}?`)) return
    setSaving(true)
    setError('')
    try {
      await userService.deleteUser(u.userId)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Vô hiệu hóa thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="user-management">
      <h2>Quản lý người dùng và phân quyền</h2>
      {error && <p className="placeholder-note" style={{ color: '#e74c3c' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', width: 200 }}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '8px 12px' }}>
          <option value="">Tất cả vai trò</option>
          {roles.map((r) => (
            <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
          ))}
        </select>
        <button type="button" className="btn btn-success" onClick={handleOpenCreate}>Thêm user</button>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.userId} className={!u.isActive ? 'user-inactive' : ''}>
                <td>{u.username}</td>
                <td>{u.displayName || '-'}</td>
                <td>{u.roleName}</td>
                <td>{u.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}</td>
                <td>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(u)} disabled={saving}>Sửa</button>
                  {u.isActive && (
                    <button type="button" className="btn btn-delete btn-sm" onClick={() => handleDeactivate(u)} disabled={saving} style={{ marginLeft: 8 }}>
                      Vô hiệu hóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingUser ? 'Sửa user' : 'Thêm user'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={!!editingUser}
                  placeholder="username"
                />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" />
                </div>
              )}
              <div className="form-group">
                <label>Họ tên</label>
                <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Tùy chọn" />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                  {roles.map((r) => (
                    <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                  ))}
                </select>
              </div>
              {editingUser && (
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    Hoạt động
                  </label>
                </div>
              )}
              {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={saving}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
