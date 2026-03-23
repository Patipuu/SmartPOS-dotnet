import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '../../../api/client'
import './MenuManagement.css'

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([])
  const [menus, setMenus] = useState([]) // categories in PRD = menus in backend
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    menuId: '',
    description: '',
    imageUrl: '',
    isAvailable: true,
    sortOrder: 0,
  })

  const fetchMenu = useCallback(async () => {
    const { data } = await apiClient.get('/api/Admin/menu')
    setMenuItems(Array.isArray(data) ? data : [])
  }, [])

  const fetchMenus = useCallback(async () => {
    const { data } = await apiClient.get('/api/Admin/categories')
    setMenus(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    fetchMenu()
    fetchMenus()
  }, [fetchMenu, fetchMenus])

  const resetForm = useCallback(() => {
    const firstMenuId = menus?.[0]?.menuId ?? ''
    setEditingItem(null)
    setFormData({
      name: '',
      price: '',
      menuId: firstMenuId,
      description: '',
      imageUrl: '',
      isAvailable: true,
      sortOrder: 0,
    })
  }, [menus])

  useEffect(() => {
    // if menus loaded later, ensure menuId exists for create mode
    if (!showForm) return
    if (!formData.menuId && menus?.[0]?.menuId) {
      setFormData((prev) => ({ ...prev, menuId: menus[0].menuId }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      menuId: Number(formData.menuId),
      name: formData.name,
      description: formData.description || null,
      imageUrl: formData.imageUrl || null,
      price: Number(formData.price),
      isAvailable: !!formData.isAvailable,
      sortOrder: Number(formData.sortOrder) || 0,
    }

    try {
      if (editingItem) {
        await apiClient.put(`/api/Admin/menu/${editingItem.menuItemId}`, payload)
      } else {
        await apiClient.post('/api/Admin/menu', payload)
      }
      await fetchMenu()
      setShowForm(false)
      resetForm()
    } catch (err) {
      console.error(err)
      alert('Lưu món thất bại')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      price: item.price ?? '',
      menuId: item.menuId ?? '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable !== false,
      sortOrder: item.sortOrder ?? 0,
    })
    setShowForm(true)
  }

  const handleDelete = async (menuItemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này?')) return
    try {
      await apiClient.delete(`/api/Admin/menu/${menuItemId}`)
      await fetchMenu()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="menu-management">
      <div className="header-actions">
        <h2>Quản lý Món ăn</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          Thêm món mới
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingItem ? 'Sửa món' : 'Thêm món mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên món</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giá (đ)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Danh mục</label>
                <select
                  value={formData.menuId}
                  onChange={(e) => setFormData({ ...formData, menuId: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {menus.map((m) => (
                    <option key={m.menuId} value={m.menuId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>ImageUrl (thumbnail)</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="VD: https://.../image.jpg"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  Hiện món trên QR Menu
                </label>
              </div>

              <div className="form-group">
                <label>Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  Lưu
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="menu-items-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên món</th>
              <th>Giá</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.menuItemId}>
                <td>{item.menuItemId}</td>
                <td>{item.name}</td>
                <td>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                <td>{item.menuName ?? item.menuId}</td>
                <td>{item.isAvailable === false ? 'Ẩn' : 'Hiện'}</td>
                <td>
                  <button type="button" className="btn-edit" onClick={() => handleEdit(item)}>
                    Sửa
                  </button>
                  <button type="button" className="btn-delete" onClick={() => handleDelete(item.menuItemId)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MenuManagement
