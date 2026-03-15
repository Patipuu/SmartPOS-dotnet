# Tài liệu – Smart POS

## Đặc tả và Triển khai (deployments)

Bộ tài liệu mô tả phần mềm, công nghệ, thiết lập môi trường và cách triển khai:

- **[deployments/README.md](deployments/README.md)** – Mục lục và liên kết.
- **Nội dung:** Tổng quan, Technology stack, Environment setup, Cách chạy ứng dụng, Deployment production.

## Database

- **Schema / ERD:** Xem trong `docs/` (database-erd.md nếu có) – Sơ đồ và mô tả bảng.
- **[../Database/README.md](../Database/README.md)** – Hướng dẫn migration và seed.

## Tóm tắt đề cương / Requirements

Dự án **Smart POS** (Nhóm 8B) – Hệ thống quản lý nhà hàng và gọi món thông minh.

### Chức năng chính

- **Khách hàng:** Quét QR xác định bàn → Xem menu theo danh mục → Thêm món vào giỏ → Gửi đơn → Theo dõi trạng thái đơn realtime → Yêu cầu thanh toán.
- **Bếp/Bar:** Nhận đơn realtime → Cập nhật trạng thái món (Đang chế biến / Hoàn thành).
- **Thu ngân:** Xem đơn chờ thanh toán → Tạo hóa đơn từ đơn → Thanh toán → In hóa đơn.
- **Quản lý:** Quản lý món ăn, danh mục, báo cáo doanh thu và đơn hàng.

### Công nghệ

- **Frontend:** React 18, Vite, React Router, SignalR Client, Axios, QR Scanner.
- **Backend:** ASP.NET Core (.NET 9/10), SignalR, Entity Framework Core, SQL Server, JWT.

### API & SignalR

- API base: `http://localhost:5000` (cấu hình qua `VITE_API_URL`).
- SignalR hubs:
  - `/hubs/order` – OrderHub: JoinTableGroup(tableId), JoinKitchenGroup(), sự kiện `OrderUpdated`, `NewOrder`.

Chi tiết đầy đủ xem trong đề cương PDF (Nhom8B_De-cuong-tieu-luan_SmartPOS.pdf).
