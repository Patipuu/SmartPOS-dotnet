import { useState, useEffect } from 'react'
import { apiClient } from '../../../api/client'
import './Menu.css'

const Menu = ({ onAddToCart }) => {
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    apiClient
      .get('/api/Customer/menu')
      .then(({ data }) => {
        if (cancelled) return
        setCategories(data.categories || [])
        setMenuItems(data.menuItems || [])
        if (data.categories?.length) {
          setSelectedCategory((prev) => prev ?? data.categories[0].menuId)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Không tải được thực đơn')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filteredItems = menuItems.filter((item) => item.menuId === selectedCategory)

  if (loading) return <div className="menu"><p>Đang tải thực đơn...</p></div>
  if (error) return <div className="menu"><p className="menu-error">{error}</p></div>

  return (
    <div className="menu">
      <h2>Thực đơn</h2>
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.menuId ?? category.id}
            className={`category-tab ${selectedCategory === (category.menuId ?? category.id) ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.menuId ?? category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="menu-items">
        {filteredItems.map((item) => {
          const available = item.isAvailable !== false
          const menuItemId = item.menuItemId ?? item.id

          return (
            <div key={menuItemId} className="menu-item">
              <div className="menu-item-info">
                <h3>{item.name}</h3>

                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="menu-item-image"
                    loading="lazy"
                  />
                )}

                <p className="price">{Number(item.price).toLocaleString('vi-VN')} đ</p>

                {!available && <span className="badge badge-out-of-stock">Tạm hết</span>}
              </div>

              <button
                type="button"
                className="btn btn-primary"
                disabled={!available}
                onClick={() =>
                  onAddToCart?.({
                    menuItemId,
                    name: item.name,
                    price: item.price,
                  })
                }
              >
                {available ? 'Thêm vào giỏ' : 'Không có sẵn'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Menu
