import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../../../api/client'
import * as inventoryService from '../../../services/inventoryService'
import * as bomService from '../../../services/bomService'
import './InventoryPlaceholder.css'

const InventoryPlaceholder = () => {
  const [inventoryItems, setInventoryItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [newInvName, setNewInvName] = useState('')
  const [newInvUnit, setNewInvUnit] = useState('')
  const [newInvQty, setNewInvQty] = useState('0')
  const [ioItemId, setIoItemId] = useState('')
  const [ioQty, setIoQty] = useState('0')
  const [ioType, setIoType] = useState('IMPORT')
  const [txFilter, setTxFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [menuItems, setMenuItems] = useState([])
  const [selectedMenuItemId, setSelectedMenuItemId] = useState(null)
  const [bomEntries, setBomEntries] = useState([])
  const [bomIngredientId, setBomIngredientId] = useState('')
  const [bomQtyPerUnit, setBomQtyPerUnit] = useState('')

  const loadInventory = useCallback(async () => {
    setError('')
    try {
      const [inv, tx] = await Promise.all([
        inventoryService.getInventoryItems(),
        inventoryService.getStockTransactions({ limit: 50 }),
      ])
      setInventoryItems(inv)
      setTransactions(tx)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải tồn kho')
    }
  }, [])

  const loadMenuItems = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/Admin/menu')
      const list = Array.isArray(data) ? data : []
      setMenuItems(list)
      if (!selectedMenuItemId && list.length) setSelectedMenuItemId(list[0].menuItemId)
    } catch {
      setMenuItems([])
    }
  }, [selectedMenuItemId])

  const loadBOM = useCallback(async () => {
    if (!selectedMenuItemId) return
    try {
      const entries = await bomService.getBOM(selectedMenuItemId)
      setBomEntries(entries)
    } catch {
      setBomEntries([])
    }
  }, [selectedMenuItemId])

  useEffect(() => {
    setLoading(true)
    loadInventory().finally(() => setLoading(false))
  }, [loadInventory])

  useEffect(() => {
    loadMenuItems()
  }, [loadMenuItems])

  useEffect(() => {
    loadBOM()
  }, [loadBOM])

  useEffect(() => {
    if (inventoryItems.length && !bomIngredientId) setBomIngredientId(String(inventoryItems[0].inventoryItemId))
  }, [inventoryItems, bomIngredientId])

  const filteredTx = useMemo(() => {
    if (txFilter === 'ALL') return transactions
    return transactions.filter((t) => String(t.type) === txFilter)
  }, [transactions, txFilter])

  const handleCreateInventoryItem = async () => {
    const name = String(newInvName || '').trim()
    const unit = String(newInvUnit || '').trim()
    const qty = Number(newInvQty)
    if (!name) { setError('Tên nguyên liệu không được trống'); return }
    if (!Number.isFinite(qty) || qty < 0) { setError('Số lượng tồn ban đầu phải >= 0'); return }
    setError('')
    setSaving(true)
    try {
      await inventoryService.createInventoryItem({ name, unit, stockQty: qty })
      setNewInvName('')
      setNewInvUnit('')
      setNewInvQty('0')
      await loadInventory()
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo nguyên liệu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleIO = async () => {
    const id = ioItemId ? Number(ioItemId) : null
    const qty = Number(ioQty)
    if (!id) { setError('Chọn nguyên liệu'); return }
    if (!Number.isFinite(qty) || qty <= 0) { setError('SL thao tác phải > 0'); return }
    setError('')
    setSaving(true)
    try {
      if (ioType === 'IMPORT') {
        await inventoryService.importStock(id, qty, 'Admin import')
      } else {
        await inventoryService.exportStock(id, qty, 'Admin export')
      }
      setIoQty('0')
      await loadInventory()
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleAddBomEntry = () => {
    const id = bomIngredientId ? Number(bomIngredientId) : null
    const q = Number(bomQtyPerUnit)
    if (!id) { setError('Chọn nguyên liệu'); return }
    if (!Number.isFinite(q) || q <= 0) { setError('Định mức phải là số dương'); return }
    const inv = inventoryItems.find((i) => i.inventoryItemId === id)
    const name = inv?.name || ''
    setBomEntries((prev) => {
      const exists = prev.some((x) => x.inventoryItemId === id)
      if (exists) return prev.map((x) => (x.inventoryItemId === id ? { ...x, qtyPerUnit: q } : x))
      return [...prev, { inventoryItemId: id, inventoryItemName: name, qtyPerUnit: q }]
    })
    setBomQtyPerUnit('')
    setError('')
  }

  const handleRemoveBomEntry = (inventoryItemId) => {
    setBomEntries((prev) => prev.filter((x) => x.inventoryItemId !== inventoryItemId))
  }

  const handleSaveBOM = async () => {
    if (!selectedMenuItemId) return
    setError('')
    setSaving(true)
    try {
      await bomService.saveBOM(selectedMenuItemId, bomEntries.map((e) => ({ inventoryItemId: e.inventoryItemId, qtyPerUnit: e.qtyPerUnit })))
      await loadBOM()
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu BOM thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="inventory-placeholder">
      <h2>Theo dõi tồn kho và công thức</h2>
      {error && <p className="placeholder-note" style={{ color: '#e74c3c' }}>{error}</p>}

      <div className="inv-section">
        <h3>1) Nguyên liệu (Inventory)</h3>

        <div className="form-actions" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <h4>Tạo nguyên liệu</h4>
            <div className="form-group">
              <label>Tên nguyên liệu</label>
              <input value={newInvName} onChange={(e) => setNewInvName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Đơn vị</label>
              <input value={newInvUnit} onChange={(e) => setNewInvUnit(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Số lượng tồn ban đầu</label>
              <input type="number" value={newInvQty} onChange={(e) => setNewInvQty(e.target.value)} />
            </div>
            <button type="button" className="btn btn-success" onClick={handleCreateInventoryItem} disabled={saving}>Tạo nguyên liệu</button>
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <h4>Nhập/Xuất kho</h4>
            <div className="form-group">
              <label>Kiểu thao tác</label>
              <select value={ioType} onChange={(e) => setIoType(e.target.value)}>
                <option value="IMPORT">Nhập kho</option>
                <option value="EXPORT">Xuất kho</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nguyên liệu</label>
              <select value={ioItemId} onChange={(e) => setIoItemId(e.target.value)}>
                <option value="">Chọn nguyên liệu</option>
                {inventoryItems.map((x) => (
                  <option key={x.inventoryItemId} value={x.inventoryItemId}>{x.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Số lượng</label>
              <input type="number" value={ioQty} onChange={(e) => setIoQty(e.target.value)} />
            </div>
            <button type="button" className="btn btn-primary" onClick={handleIO} disabled={saving}>
              Tạo phiếu {ioType === 'IMPORT' ? 'nhập' : 'xuất'}
            </button>
          </div>
        </div>

        <h4 style={{ marginTop: 18 }}>Tồn kho hiện tại</h4>
        {loading ? <p>Đang tải...</p> : inventoryItems.length === 0 ? (
          <p>Chưa có nguyên liệu.</p>
        ) : (
          <ul>
            {inventoryItems.map((x) => (
              <li key={x.inventoryItemId}>
                {x.name}: <strong>{Number(x.stockQty).toLocaleString('vi-VN')}</strong> {x.unit || ''}
              </li>
            ))}
          </ul>
        )}

        <h4 style={{ marginTop: 18 }}>Lịch sử giao dịch kho</h4>
        <div className="form-group">
          <label>Filter</label>
          <select value={txFilter} onChange={(e) => setTxFilter(e.target.value)}>
            <option value="ALL">Tất cả</option>
            <option value="Import">Nhập</option>
            <option value="Export">Xuất</option>
          </select>
        </div>
        {filteredTx.length === 0 ? <p>Chưa có giao dịch.</p> : (
          <ul>
            {filteredTx.slice(0, 30).map((tx) => (
              <li key={tx.transactionId}>
                [{tx.type}] {tx.inventoryItemName || ''}: {Number(tx.quantity).toLocaleString('vi-VN')} @ {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString('vi-VN') : '-'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bom-section" style={{ marginTop: 28 }}>
        <h3>2) BOM (Công thức theo món)</h3>
        <div className="form-group">
          <label>Món ăn</label>
          <select value={selectedMenuItemId ?? ''} onChange={(e) => setSelectedMenuItemId(e.target.value ? Number(e.target.value) : null)}>
            {menuItems.map((m) => (
              <option key={m.menuItemId} value={m.menuItemId}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="bom-editor">
          <h4>Định mức nguyên liệu</h4>
          <div className="form-group">
            <label>Nguyên liệu</label>
            <select value={bomIngredientId} onChange={(e) => setBomIngredientId(e.target.value)}>
              {inventoryItems.map((x) => (
                <option key={x.inventoryItemId} value={x.inventoryItemId}>{x.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Định mức (cho 1 phần món)</label>
            <input type="number" value={bomQtyPerUnit} onChange={(e) => setBomQtyPerUnit(e.target.value)} placeholder="VD: 40" />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleAddBomEntry}>Thêm / cập nhật định mức</button>

          <div style={{ marginTop: 14 }}>
            {bomEntries.length === 0 ? <p>Chưa có BOM cho món này.</p> : (
              <table>
                <thead>
                  <tr><th>Nguyên liệu</th><th>Định mức</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                  {bomEntries.map((e) => (
                    <tr key={e.inventoryItemId}>
                      <td>{e.inventoryItemName}</td>
                      <td>{Number(e.qtyPerUnit).toLocaleString('vi-VN')}</td>
                      <td>
                        <button type="button" className="btn btn-delete" onClick={() => handleRemoveBomEntry(e.inventoryItemId)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button type="button" className="btn btn-success" onClick={handleSaveBOM} style={{ marginTop: 12 }} disabled={saving}>Lưu BOM</button>
        </div>
      </div>
    </div>
  )
}

export default InventoryPlaceholder
