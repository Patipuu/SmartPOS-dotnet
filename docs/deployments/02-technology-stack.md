# 2. Công nghệ sử dụng (Technology Stack)

## 2.1 Tổng quan

| Tầng | Công nghệ | Ghi chú |
|------|-----------|---------|
| Frontend | React 18 + Vite 7 | SPA, build tool Vite |
| Routing | React Router v6 | Định tuyến phía client |
| HTTP client | Axios | Gọi REST API, interceptors (token) |
| Realtime | SignalR Client (@microsoft/signalr) | Kết nối OrderHub |
| QR | qr-scanner | Quét QR xác định bàn |
| Backend | ASP.NET Core (.NET 10) | Web API |
| Auth | JWT (Bearer) | Đăng nhập, phân quyền |
| Realtime server | SignalR | OrderHub, NotificationHub |
| ORM | Entity Framework Core 9 | Truy vấn SQL Server |
| Database | SQL Server / LocalDB | Lưu trữ chính |
| Hash mật khẩu | BCrypt.Net-Next | Băm mật khẩu user |
| API docs | Swashbuckle (Swagger) 6.5 | UI tài liệu API |

---

## 2.2 Frontend – Chi tiết

| Gói | Phiên bản | Mục đích |
|-----|-----------|----------|
| react | ^18.3.1 | UI library |
| react-dom | ^18.3.1 | React DOM renderer |
| react-router-dom | ^6.26.0 | Client-side routing |
| axios | ^1.7.2 | HTTP client |
| @microsoft/signalr | ^8.0.0 | Kết nối SignalR (OrderHub) |
| qr-scanner | ^1.4.2 | Quét QR từ camera |
| vite | ^7.3.1 | Build tool, dev server |
| @vitejs/plugin-react | ^4.3.1 | Hỗ trợ React cho Vite |
| eslint + plugins | ^8.57.0 | Kiểm tra mã nguồn |

- **Ngôn ngữ:** JavaScript (ES modules)  
- **Cấu trúc:** Component-based (pages, components, context, hooks, api).

---

## 2.3 Backend – Chi tiết

| Gói | Phiên bản | Mục đích |
|-----|-----------|----------|
| Microsoft.AspNetCore.Authentication.JwtBearer | 9.0.0 | Xác thực JWT |
| Microsoft.EntityFrameworkCore | 9.0.0 | ORM core |
| Microsoft.EntityFrameworkCore.SqlServer | 9.0.0 | Provider SQL Server |
| Microsoft.EntityFrameworkCore.Tools | 9.0.0 | Migrations (dotnet ef) |
| BCrypt.Net-Next | 4.0.3 | Hash mật khẩu |
| Swashbuckle.AspNetCore | 6.5.0 | Swagger UI |

- **Framework:** .NET 10 (TargetFramework: net10.0)  
- **SignalR:** Đi kèm ASP.NET Core (không cần package riêng).  
- **Cấu trúc:** Controllers, Entities, DbContext, DTOs, Services, Hubs.

---

## 2.4 Cơ sở dữ liệu

- **Hệ quản trị:** Microsoft SQL Server hoặc SQL Server LocalDB.  
- **Schema:** Quản lý bằng EF Core Migrations (thư mục `Migrations/`).  
- **Sơ đồ:** Tham khảo tài liệu ERD trong `docs/` (database-erd.md nếu có).

Các nhóm bảng chính:

- **Phân quyền / phiên:** Role, User, Terminal, POSSession  
- **Phục vụ:** Table, Order, OrderItem, Menu, MenuItem  
- **Thanh toán:** Invoice, Payment  
- **Bếp:** Kitchen, KitchenStation, KOT  
- **Công thức / kho:** Recipe, BOM, InventoryItem, StockTransaction  
- **Cảnh báo / báo cáo:** Checklist, OperationalAlert, Report, SalesReport, ProfitLossReport, PerformanceReport  

---

## 2.5 Giao thức và cổng mặc định

| Dịch vụ | Giao thức | Cổng mặc định (dev) |
|---------|-----------|----------------------|
| Backend API | HTTP | 5000 |
| Swagger UI | HTTP | 5000/swagger |
| SignalR (OrderHub) | HTTP/WebSocket | 5000/hubs/order |
| SignalR (NotificationHub) | HTTP/WebSocket | 5000/hubs/notification |
| Frontend (Vite dev) | HTTP | 5173 |
