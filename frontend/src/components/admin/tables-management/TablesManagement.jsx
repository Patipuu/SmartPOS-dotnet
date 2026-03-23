import { useCallback, useEffect, useState } from 'react'
import { getAdminTables, createTable, updateTable, deleteTable } from '../../../services/tablesService'
import './TablesManagement.css'

function qrServerUrl(data) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(data)}`
}

async function downloadImage(url, filename) {
  const res = await fetch(url)
  const blob = await res.blob()
  const objUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objUrl
  a.download = filename
  a.click()
  URL.revokeObjectURL(objUrl)
}

const TablesManagement = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ code: '', name: '', capacity: '4', area: 'Main' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', capacity: '', area: '' })

  const loadTables = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await getAdminTables()
      setTables(list)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách bàn')
      setTables([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTables()
  }, [loadTables])

  const handleCreate = async () => {
    const code = String(form.code || '').trim()
    const name = String(form.name || '').trim()
    const cap = form.capacity ? Number(form.capacity) : null
    const area = String(form.area || '').trim() || null

    if (!code) { setError('Code bàn không được trống (VD: T01)'); return }
    if (!name) { setError('Tên bàn không được trống'); return }
    if (cap != null && (!Number.isFinite(cap) || cap <= 0)) { setError('Sức chứa phải > 0'); return }

    setError('')
    setSaving(true)
    try {
      await createTable({ code, name, capacity: cap, area })
      setForm({ code: '', name: '', capacity: '4', area: 'Main' })
      await loadTables()
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo bàn thất bại')
      if (err.response?.status === 409) setError('Code bàn đã tồn tại')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (t) => {
    setEditingId(t.tableId)
    setEditForm({ name: t.name || '', capacity: t.capacity != null ? String(t.capacity) : '', area: t.area || '' })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    const name = String(editForm.name || '').trim()
    const cap = editForm.capacity ? Number(editForm.capacity) : null
    const area = String(editForm.area || '').trim() || null

    setError('')
    setSaving(true)
    try {
      await updateTable(editingId, { name: name || undefined, capacity: cap, area })
      setEditingId(null)
      await loadTables()
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`Xóa bàn "${t.name || t.code}"?`)) return
    setError('')
    setSaving(true)
    try {
      await deleteTable(t.tableId)
      if (editingId === t.tableId) setEditingId(null)
      await loadTables()
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa thất bại')
      if (err.response?.status === 400) setError('Bàn đang phục vụ, không thể xóa')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="tables-management">
      <h2>Quản lý Bàn & QR</h2>

      {error && <p className="placeholder-note" style={{ color: '#e74c3c' }}>{error}</p>}

      <div className="tables-create">
        <h3>Tạo bàn mới</h3>
        <div className="form-group">
          <label>Code bàn (QR payload dùng để tìm bàn)</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: T99" />
        </div>
        <div className="form-group">
          <label>Tên bàn</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Bàn T99" />
        </div>
        <div className="form-group">
          <label>Sức chứa</label>
          <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Khu vực</label>
          <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
        </div>
        <button type="button" className="btn btn-success" onClick={handleCreate} disabled={saving}>Tạo bàn</button>
      </div>

      <div className="tables-list">
        <h3>Danh sách bàn ({tables.length})</h3>

        {loading ? (
          <p>Đang tải...</p>
        ) : tables.length === 0 ? (
          <p>Chưa có bàn.</p>
        ) : (
          <div className="tables-grid">
            {tables.map((t) => {
              const qrPayload = `${window.location.origin}/menu/${t.code || t.tableId}`
              const imgUrl = qrServerUrl(qrPayload)
              const isEditing = editingId === t.tableId

              return (
                <div key={t.tableId} className="table-card">
                  <div className="table-card-title">
                    {isEditing ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Tên bàn"
                        style={{ width: '100%', padding: 4 }}
                      />
                    ) : (
                      <>{t.name} <small>(Code: {t.code})</small></>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="form-group" style={{ margin: '8px 0' }}>
                      <label>Sức chứa</label>
                      <input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} />
                    </div>
                  ) : (
                    <div className="table-meta">Sức chứa: {t.capacity ?? '-'} · {t.area || '-'}</div>
                  )}
                  {isEditing && (
                    <div className="form-group" style={{ margin: '8px 0' }}>
                      <label>Khu vực</label>
                      <input value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} />
                    </div>
                  )}

                  <div className="qr-preview">
                    <img src={imgUrl} alt={`QR ${t.name}`} />
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <button type="button" className="btn btn-primary" onClick={() => downloadImage(imgUrl, `table_${t.code}_qr.png`)}>
                      Tải QR PNG
                    </button>
                    {isEditing ? (
                      <>
                        <button type="button" className="btn btn-success" onClick={handleSaveEdit} disabled={saving}>Lưu</button>
                        <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)}>Hủy</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn btn-outline" onClick={() => handleEdit(t)} disabled={saving}>Sửa</button>
                        <button type="button" className="btn btn-delete" onClick={() => handleDelete(t)} disabled={saving}>Xóa</button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TablesManagement
