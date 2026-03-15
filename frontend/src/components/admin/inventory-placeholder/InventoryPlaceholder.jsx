import './InventoryPlaceholder.css'

const InventoryPlaceholder = () => {
  return (
    <div className="inventory-placeholder">
      <h2>Theo dõi tồn kho và công thức</h2>
      <p className="placeholder-note">
        Khi backend có entity Inventory_Item, Recipe, BOM và API tương ứng, kết nối tại đây.
      </p>
      <ul>
        <li>Xem tồn kho nguyên liệu theo thời gian thực</li>
        <li>Quản lý công thức món (Recipe, BOM)</li>
        <li>Cảnh báo hết hàng</li>
      </ul>
    </div>
  )
}

export default InventoryPlaceholder
