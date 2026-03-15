# Smart POS - Hệ thống Quản lý Nhà hàng và Gọi món thông minh

## Mô tả
Hệ thống quản lý nhà hàng với tính năng gọi món qua QR code, quản lý đơn hàng realtime, thanh toán và báo cáo.

## Cấu trúc dự án

```
system-pos-restaurant/
├── frontend/          # React + Vite
├── backend/           # ASP.NET Core (.NET 9/10)
├── Database/          # Hướng dẫn database và migrations
├── docs/              # Tài liệu
└── scripts/           # Utility scripts
```

## Yêu cầu hệ thống

### Frontend
- Node.js >= 18.x
- npm hoặc yarn

### Backend
- .NET 9 SDK (hoặc .NET 10)
- SQL Server hoặc SQL Server LocalDB
- EF Core tools: `dotnet tool install --global dotnet-ef`

## Biến môi trường

### Frontend
Tạo file `frontend/.env` (copy từ `frontend/env.example`):

```
VITE_API_URL=http://localhost:5000
```

Nếu backend chạy ở port khác, sửa `VITE_API_URL` cho đúng.

### Backend
Connection string cấu hình trong `backend/src/API/appsettings.json` hoặc `appsettings.Development.json`. JWT cấu hình trong `appsettings.json` (section `Jwt`).

## Cài đặt và chạy

### 1. Database

```bash
cd backend/src/API
dotnet restore
dotnet ef database update
```

Lần đầu chạy ứng dụng sẽ tự seed: user `admin` / `admin123`, danh mục, món mẫu, bàn (T01, T02, T03). Chi tiết xem [Database/README.md](Database/README.md).

### 2. Backend

```bash
cd backend/src/API
dotnet run
```

- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173  

## Các trang chính

- `/customer` – Trang khách hàng (QR, menu, giỏ hàng, trạng thái đơn)
- `/kitchen` – Trang bếp/bar (đơn realtime, cập nhật trạng thái) – *yêu cầu đăng nhập*
- `/cashier` – Trang thu ngân (hóa đơn, thanh toán) – *yêu cầu đăng nhập*
- `/admin` – Trang quản lý (menu, danh mục, báo cáo) – *yêu cầu đăng nhập*
- `/login` – Đăng nhập (mặc định: `admin` / `admin123`)

## Tính năng

### Khách hàng
- Quét QR code để xác định bàn (API `GET /api/Customer/table/{code}`)
- Xem menu theo danh mục, thêm món vào giỏ, gửi đơn
- Theo dõi trạng thái đơn hàng realtime (SignalR)
- Yêu cầu thanh toán

### Bếp/Bar
- Nhận đơn hàng realtime (SignalR NewOrder)
- Cập nhật trạng thái món (Pending → Preparing → Ready)

### Thu ngân
- Xem đơn chờ thanh toán, tạo hóa đơn từ đơn
- Xem danh sách và chi tiết hóa đơn, xử lý thanh toán, in hóa đơn

### Quản lý
- CRUD món ăn, danh mục
- Báo cáo doanh thu (theo kỳ), báo cáo đơn hàng và món bán chạy

## Công nghệ

### Frontend
- React 18, React Router, Vite
- SignalR Client (@microsoft/signalr), Axios, QR Scanner

### Backend
- ASP.NET Core (.NET 9), JWT, SignalR
- Entity Framework Core, SQL Server, BCrypt

## Tác giả

- Trịnh Lê Huy
- Nguyễn Quốc Tuấn
- Phạm Thiên Phú
- Lâm Nguyễn Hồng Tài

## Giảng viên hướng dẫn

ThS. Trần Đình Nghĩa
