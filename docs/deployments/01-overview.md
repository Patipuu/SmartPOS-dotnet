# 1. Tổng quan phần mềm Smart POS

## 1.1 Giới thiệu

**Smart POS** (Point of Sale) là hệ thống quản lý nhà hàng và gọi món thông minh, hỗ trợ:

- Gọi món qua QR code theo bàn
- Quản lý đơn hàng và trạng thái chế biến theo thời gian thực
- Thanh toán, in hóa đơn, đối chiếu ca
- Quản lý menu, giá, báo cáo doanh thu và phân quyền

Phần mềm gồm **Frontend** (React) và **Backend** (ASP.NET Core API), kết nối qua REST API và SignalR.

---

## 1.2 Đối tượng sử dụng (Actor)

| Đối tượng | Mô tả | Màn hình |
|-----------|--------|----------|
| **Quản lý (Admin/Manager)** | Quản lý người dùng và phân quyền, menu, giá, công thức, tồn kho, doanh thu, báo cáo lãi-lỗ, hiệu suất nhân viên, cảnh báo vận hành | `/admin` |
| **Nhân viên phục vụ** | Theo dõi trạng thái món ăn và khách hàng | (tích hợp trong luồng khách / bếp) |
| **Khách hàng** | Gọi món, cập nhật trạng thái bàn, gửi yêu cầu chế biến xuống bếp | `/customer` |
| **Thu ngân** | Mở/đóng ca POS, thanh toán hóa đơn, in/xuất hóa đơn, đối chiếu tiền mặt | `/cashier` |
| **Nhân viên bếp** | Xử lý KOT, cập nhật trạng thái chế biến, đồng bộ với phục vụ và thu ngân | `/kitchen` |
| **Hệ thống** | Kiểm tra tồn kho, sinh KOT và cảnh báo, tổng hợp báo cáo | (backend / batch) |

---

## 1.3 Yêu cầu chức năng chính

- **Quản lý danh mục món ăn, loại món và giá bán**
- **Quản lý bàn ăn và trạng thái bàn** (trống, đang phục vụ, đã thanh toán)
- **Gọi món, chỉnh sửa món, hủy món**
- **Tự động tính tiền và lập hóa đơn**
- **Thống kê, báo cáo doanh thu** theo ngày/tuần/tháng
- **Phân quyền người dùng** theo vai trò (Role)

---

## 1.4 Cấu trúc dự án

```
system-pos-restaurant/
├── frontend/                 # Ứng dụng web React (Vite)
│   ├── src/
│   │   ├── api/              # API client (axios)
│   │   ├── components/       # Component theo từng màn (customer, kitchen, cashier, admin, shared)
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useOrderHub (SignalR)
│   │   ├── pages/            # Trang: home, customer, kitchen, cashier, admin, login
│   │   └── main.jsx, App.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   └── src/
│       └── API/              # ASP.NET Core Web API
│           ├── Controllers/  # Auth, Customer, Kitchen, Cashier, Admin
│           ├── Data/         # Entities, DbContext, DbSeeder
│           ├── Hubs/         # OrderHub, NotificationHub
│           ├── Models/       # DTOs
│           ├── Services/     # AuthService
│           ├── Migrations/
│           ├── Program.cs
│           └── appsettings.json
├── Database/                 # Hướng dẫn database, migrations
├── docs/                     # Tài liệu (README, ERD, deployments)
└── README.md
```

---

## 1.5 Luồng nghiệp vụ chính

1. **Khách hàng**: Quét QR bàn → Chọn món → Gửi đơn → Theo dõi trạng thái → Yêu cầu thanh toán  
2. **Bếp**: Nhận đơn (SignalR) → Cập nhật từng món (Đang chế biến / Hoàn thành)  
3. **Thu ngân**: Xem đơn chờ thanh toán → Tạo hóa đơn → Thanh toán (tiền mặt/thẻ) → In hóa đơn  
4. **Quản lý**: CRUD menu/danh mục, xem báo cáo doanh thu và đơn hàng, (sau này) người dùng, tồn kho, cảnh báo  

---

## 1.6 Tác giả và giảng viên

- **Tác giả:** Trịnh Lê Huy, Nguyễn Quốc Tuấn, Phạm Thiên Phú, Lâm Nguyễn Hồng Tài  
- **Giảng viên hướng dẫn:** ThS. Trần Đình Nghĩa  
