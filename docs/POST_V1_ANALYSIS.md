# SmartPOS Post v1.0 — Phân tích & Kế hoạch

## BƯỚC 1 — PHÂN TÍCH CODEBASE (File Classification)

### Backend

| File | Classification | Lý do |
|------|----------------|-------|
| `API/Data/Entities/POSSession.cs` | [UPDATE] | Thêm CloseNote, OpenCash |
| `API/Data/Entities/Table.cs` | [UPDATE] | Thêm Capacity, Area |
| `API/Data/Entities/StockTransaction.cs` | [UPDATE] | Thêm Reason |
| `API/Data/Entities/OperationalAlert.cs` | [UPDATE] | Thêm Message, ResolvedAt |
| `API/Controllers/Cashier/CashierController.cs` | [UPDATE] | Thêm session + tables endpoints |
| `API/Controllers/Admin/AdminController.cs` | [UPDATE] | Thêm tables, inventory, bom, users, alerts |
| `API/Controllers/Kitchen/KitchenController.cs` | [UPDATE] | Inject InventoryService, deduct on Ready |
| `API/Controllers/Auth/AuthController.cs` | [UPDATE] | Thêm change-password |
| `API/Services/AuthService.cs` | [KEEP] | Không chỉnh |
| `API/Services/InventoryService.cs` | [CREATE] | DeductByBOM, tạo alert |
| `API/Models/DTOs/*.cs` | [UPDATE] | Thêm DTOs mới |
| `API/Data/DbContext/ApplicationDbContext.cs` | [KEEP] | Không chỉnh (entities tự map) |
| `API/Data/DbSeeder.cs` | [KEEP] | Không chỉnh |
| `API/Program.cs` | [UPDATE] | Register InventoryService |
| `API/Hubs/OrderHub.cs` | [KEEP] | Không chỉnh |

### Frontend

| File | Classification | Lý do |
|------|----------------|-------|
| `api/client.js` | [KEEP] | Không chỉnh |
| `services/localBomInventory.js` | [DELETE] | Xóa sau Phase 2 |
| `services/cashierService.js` | [CREATE] | POS session API calls |
| `services/tablesService.js` | [CREATE] | Tables CRUD |
| `services/inventoryService.js` | [CREATE] | Inventory + transactions |
| `services/bomService.js` | [CREATE] | BOM get/save |
| `services/userService.js` | [CREATE] | Users, roles |
| `services/authService.js` | [CREATE] | changePassword |
| `services/alertService.js` | [CREATE] | Alerts |
| `components/cashier/pos-session/POSSession.jsx` | [UPDATE] | Dùng API thay localStorage |
| `components/admin/tables-management/TablesManagement.jsx` | [UPDATE] | Dùng API |
| `pages/cashier/CashierPage.jsx` | [UPDATE] | refreshTables từ API |
| `components/admin/inventory-placeholder/InventoryPlaceholder.jsx` | [UPDATE] | Dùng API (đổi tên nội bộ) |
| `components/kitchen/status-update/StatusUpdate.jsx` | [UPDATE] | Xóa deductStockForMenuItem |
| `components/admin/user-management/UserManagement.jsx` | [UPDATE] | Implement CRUD |
| `components/shared/StaffLayout.jsx` | [UPDATE] | Dropdown user + ChangePasswordModal |
| `components/admin/alerts-placeholder/AlertsPlaceholder.jsx` | [UPDATE] | Implement UI |
| `components/cashier/table-grid/TableGrid.jsx` | [KEEP] | Nhận props, không đổi |
| Các file còn lại | [KEEP] | Không chỉnh |

---

## BƯỚC 2 — FILE PLAN TỔNG THỂ

| Phase | File | Action | Lý do | Risk |
|-------|------|--------|-------|------|
| 1 | backend/API/Data/Entities/POSSession.cs | UPDATE | Thêm OpenCash, CloseNote | Low |
| 1 | backend/API/Data/Entities/Table.cs | UPDATE | Thêm Capacity, Area | Low |
| 1 | backend/API/Migrations/* | CREATE | 2 migrations | Low |
| 1 | backend/API/Models/DTOs/CashierDtos.cs | UPDATE | Session DTOs | Low |
| 1 | backend/API/Controllers/Cashier/CashierController.cs | UPDATE | session + tables endpoints | Med |
| 1 | backend/API/Controllers/Admin/AdminController.cs | UPDATE | tables CRUD | Med |
| 1 | frontend/src/services/cashierService.js | CREATE | Session API | Low |
| 1 | frontend/src/services/tablesService.js | CREATE | Tables API | Low |
| 1 | frontend/src/components/cashier/pos-session/POSSession.jsx | UPDATE | API thay localStorage | Med |
| 1 | frontend/src/components/admin/tables-management/TablesManagement.jsx | UPDATE | API | Med |
| 1 | frontend/src/pages/cashier/CashierPage.jsx | UPDATE | refreshTables từ API | Med |
| 2 | backend/API/Data/Entities/StockTransaction.cs | UPDATE | Thêm Reason | Low |
| 2 | backend/API/Migrations/* | CREATE | Phase2 migration | Low |
| 2 | backend/API/Services/InventoryService.cs | CREATE | DeductByBOM, import/export | Med |
| 2 | backend/API/Program.cs | UPDATE | Register InventoryService | Low |
| 2 | backend/API/Controllers/Admin/AdminController.cs | UPDATE | inventory, bom endpoints | Med |
| 2 | backend/API/Controllers/Kitchen/KitchenController.cs | UPDATE | Deduct on Ready | Med |
| 2 | frontend/src/services/inventoryService.js | CREATE | Inventory API | Low |
| 2 | frontend/src/services/bomService.js | CREATE | BOM API | Low |
| 2 | frontend/src/components/admin/inventory-placeholder/InventoryPlaceholder.jsx | UPDATE | API | Med |
| 2 | frontend/src/components/kitchen/status-update/StatusUpdate.jsx | UPDATE | Xóa deduct | Low |
| 2 | frontend/src/services/localBomInventory.js | DELETE | Xóa mock | Low |
| 3 | backend/API/Data/Entities/OperationalAlert.cs | UPDATE | Message, ResolvedAt | Low |
| 3 | backend/API/Migrations/* | CREATE | Phase3 migration | Low |
| 3 | backend/API/Controllers/Admin/AdminController.cs | UPDATE | users, roles, alerts | Med |
| 3 | backend/API/Controllers/Auth/AuthController.cs | UPDATE | change-password | Low |
| 3 | frontend/src/services/userService.js | CREATE | Users API | Low |
| 3 | frontend/src/services/authService.js | CREATE | changePassword | Low |
| 3 | frontend/src/services/alertService.js | CREATE | Alerts API | Low |
| 3 | frontend/src/components/admin/user-management/UserManagement.jsx | UPDATE | CRUD UI | Med |
| 3 | frontend/src/components/shared/StaffLayout.jsx | UPDATE | Dropdown + modal | Med |
| 3 | frontend/src/components/ChangePasswordModal.jsx | CREATE | Form đổi mật khẩu | Low |
| 3 | frontend/src/components/admin/alerts-placeholder/AlertsPlaceholder.jsx | UPDATE | Alerts UI | Med |

---

## BƯỚC 3 — MIGRATION PLAN

| Tên migration | Entity thay đổi | Lệnh |
|---------------|-----------------|------|
| Phase1_POSSession_CloseNote_OpenCash | POSSession: +OpenCash, +CloseNote | `dotnet ef migrations add Phase1_POSSession_CloseNote_OpenCash` |
| Phase1_Table_Capacity_Area | Table: +Capacity, +Area | Có thể gộp với trên hoặc migration riêng |
| Phase2_StockTransaction_Reason | StockTransaction: +Reason | `dotnet ef migrations add Phase2_StockTransaction_Reason` |
| Phase3_OperationalAlert_Message_ResolvedAt | OperationalAlert: +Message, +ResolvedAt | `dotnet ef migrations add Phase3_OperationalAlert_Message_ResolvedAt` |

**Lưu ý:** Gộp Phase1 migrations thành 1: `Phase1_AddFields_POSSession_Table`

---

## BƯỚC 5 — TEST CHECKLIST

| # | Test case | Phase | Điều kiện | Kết quả kỳ vọng |
|---|-----------|-------|-----------|-----------------|
| 1 | Mở ca | 1 | Cashier đăng nhập, chưa có ca | POST open → 200, GET current trả session |
| 2 | Đóng ca | 1 | Đang mở ca, nhập closeCash | POST close → 200, redirect login |
| 3 | Đóng ca chênh lệch | 1 | diff!=0, không nhập note | 400, bắt buộc note |
| 4 | Mở ca khi đã mở | 1 | Đã có ca mở | POST open → 409 |
| 5 | Tables CRUD | 1 | Admin đăng nhập | GET/POST/PUT/DELETE hoạt động |
| 6 | Cashier tables | 1 | Cashier đăng nhập | GET /api/Cashier/tables trả danh sách |
| 7 | Inventory CRUD | 2 | Admin | Tạo nguyên liệu, nhập/xuất kho |
| 8 | BOM save | 2 | Admin, có menu + inventory | PUT bom → lưu, GET trả entries |
| 9 | Kitchen deduct | 2 | Bếp bấm Hoàn thành | Backend trừ kho theo BOM |
| 10 | Xóa localBomInventory | 2 | Build frontend | Không lỗi import |
| 11 | User CRUD | 3 | Admin | Thêm/sửa user, gán role |
| 12 | Đổi mật khẩu | 3 | User đăng nhập | Change password thành công |
| 13 | Alerts list | 3 | Có LowStock/DelayedOrder | Hiển thị, nút resolve |
| 14 | Alert resolve | 3 | Click resolve | Status → Resolved |
| 15 | Không self-edit | 3 | Admin sửa chính mình | 400 hoặc chặn |

---

## BƯỚC 6 — OPEN QUESTIONS

| ID | Câu hỏi | Tác động nếu sai | Đề xuất mặc định |
|----|---------|------------------|------------------|
| Q1 | DB hiện dùng SQL Server, spec ghi MySQL? | Cần đổi connection string + package | Giữ SQL Server |
| Q2 | Frontend dùng JS, spec ghi TypeScript? | Cần cấu hình TS | Giữ JS, tạo .js services |
| Q3 | Spec ghi Tailwind, project dùng CSS modules? | Cần cài Tailwind | Giữ CSS hiện tại |
| Q4 | QR URL format: /menu/{code} hay /customer?table={code}? | Customer parse payload | Giữ /menu/{code} (parse lấy code) |
| Q5 | Table status từ API: Empty/Occupied/Pending vs Available/Serving/PAYMENT_PENDING? | Map ở frontend | API trả Available/Occupied, Cashier map sang màu |
| Q6 | OperationalAlert có InventoryItemId cho LowStock? | Schema alert | Chỉ dùng Message, Type, Status |
