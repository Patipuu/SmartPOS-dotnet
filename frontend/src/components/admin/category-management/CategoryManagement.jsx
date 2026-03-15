import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../../../api/client'
import './CategoryManagement.css'

const CategoryManagement = () => {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', sortOrder: 0 })

  const fetchCategories = useCallback(() => {
    apiClient.get('/api/Admin/categories').then(({ data }) => setCategories(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/api/Admin/categories', {
        name: formData.name,
        description: formData.description || null,
        sortOrder: Number(formData.sortOrder) || 0,
      })
      fetchCategories()
      setShowForm(false)
      setFormData({ name: '', description: '', sortOrder: 0 })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="category-management">
      <div className="header-actions">
        <h2>Quản lý Danh mục</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
          Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>Thêm danh mục mới</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên danh mục</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Thứ tự</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Lưu</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ name: '', description: '', sortOrder: 0 })
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <h3>{category.name}</h3>
            <p>{category.description || '-'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryManagement
