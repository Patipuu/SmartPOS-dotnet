import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../../../api/client'
import './MenuManagement.css'

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    isAvailable: true,
    sortOrder: 0,
  })

  const fetchMenu = useCallback(() => {
    apiClient.get('/api/Admin/menu').then(({ data }) => setMenuItems(Array.isArray(data) ? data : []))
  }, [])

  const fetchCategories = useCallback(() => {
    apiClient.get('/api/Admin/categories').then(({ data }) => setCategories(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    fetchMenu()
    fetchCategories()
  }, [fetchMenu, fetchCategories])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      categoryId: Number(formData.categoryId),
      name: formData.name,
      description: formData.description || null,
      price: Number(formData.price),
      isAvailable: formData.isAvailable,
      sortOrder: Number(formData.sortOrder) || 0,
    }
    try {
      if (editingItem) {
        await apiClient.put(`/api/Admin/menu/${editingItem.id}`, payload)
      } else {
        await apiClient.post('/api/Admin/menu', payload)
      }
      fetchMenu()
      setShowForm(false)
      setEditingItem(null)
      setFormData({ name: '', price: '', categoryId: '', description: '', isAvailable: true, sortOrder: 0 })
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price,
      categoryId: String(item.categoryId),
      description: item.description || '',
      isAvailable: item.isAvailable !== false,
      sortOrder: item.sortOrder || 0,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này?')) return
    try {
      await apiClient.delete(`/api/Admin/menu/${id}`)
      fetchMenu()
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
            setEditingItem(null)
            setFormData({ name: '', price: '', categoryId: categories[0]?.id ?? '', description: '', isAvailable: true, sortOrder: 0 })
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
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
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
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Lưu</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
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
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{Number(item.price).toLocaleString('vi-VN')} đ</td>
                <td>{item.categoryName ?? item.categoryId}</td>
                <td>
                  <button type="button" className="btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                  <button type="button" className="btn-delete" onClick={() => handleDelete(item.id)}>Xóa</button>
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
