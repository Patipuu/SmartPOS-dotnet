# Database – Smart POS

## Cách tạo và cập nhật database

Ứng dụng dùng **Entity Framework Core** với **SQL Server** (hoặc LocalDB).

### Yêu cầu

- .NET SDK (9 hoặc 10)
- SQL Server LocalDB hoặc SQL Server
- Công cụ EF: `dotnet tool install --global dotnet-ef`

### Tạo / cập nhật database

1. Mở terminal tại thư mục backend API:
   ```bash
   cd backend/src/API
   ```

2. Áp dụng migrations (tạo database nếu chưa có, cập nhật schema nếu đã có):
   ```bash
   dotnet ef database update
   ```

3. Khi chạy ứng dụng lần đầu, seed data (admin user, danh mục, món mẫu, bàn) sẽ được tạo tự động nếu database trống.

### Connection string

Mặc định trong `appsettings.json`:

- **Development:** `Server=(localdb)\\mssqllocaldb;Database=SmartPOSDb_Dev;...`
- **Production:** `Server=(localdb)\\mssqllocaldb;Database=SmartPOSDb;...`

Có thể sửa trong `appsettings.json` hoặc `appsettings.Development.json` để trỏ tới SQL Server của bạn.

### Tạo migration mới (khi đổi model)

```bash
cd backend/src/API
dotnet ef migrations add TenMigration
dotnet ef database update
```

### Đăng nhập mặc định (sau khi seed)

- **Tên đăng nhập:** `admin`
- **Mật khẩu:** `admin123`
