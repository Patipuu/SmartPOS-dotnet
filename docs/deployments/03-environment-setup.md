# 3. Thiết lập môi trường (Environment Setup)

## 3.1 Yêu cầu phần cứng / hệ điều hành

- **Hệ điều hành:** Windows 10/11, macOS, hoặc Linux (có hỗ trợ .NET và Node).  
- **RAM:** Khuyến nghị ≥ 4 GB.  
- **Ổ đĩa:** Vùng trống vài trăm MB cho SDK, node_modules và database.

---

## 3.2 Cài đặt Backend

### 3.2.1 .NET SDK

- **Phiên bản:** .NET 9 hoặc .NET 10 (dự án hiện tại dùng net10.0).  
- **Tải:** [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)  
- **Kiểm tra:**

```bash
dotnet --version
```

### 3.2.2 SQL Server hoặc LocalDB

- **LocalDB** (thường đi kèm Visual Studio / SQL Server Express): dùng cho development.  
- **SQL Server** (Express/Standard/Developer): dùng khi cần server riêng hoặc production.

**Kiểm tra LocalDB (Windows):**

```bash
sqllocaldb info
```

Nếu chưa có, cài [SQL Server Express LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb).

### 3.2.3 Công cụ EF Core (Entity Framework)

Cài công cụ global để chạy migrations:

```bash
dotnet tool install --global dotnet-ef
```

Kiểm tra:

```bash
dotnet ef --version
```

---

## 3.3 Cài đặt Frontend

### 3.3.1 Node.js

- **Phiên bản:** Node.js 18.x trở lên (khuyến nghị LTS).  
- **Tải:** [https://nodejs.org](https://nodejs.org)  
- **Kiểm tra:**

```bash
node --version
npm --version
```

### 3.3.2 Package manager

Dùng **npm** (đi kèm Node) hoặc **yarn** / **pnpm** tùy quy ước dự án. Tài liệu mặc định dùng `npm`.

---

## 3.4 Clone và cấu trúc thư mục

1. Clone repository (hoặc giải nén mã nguồn):

```bash
git clone <url-repo> system-pos-restaurant
cd system-pos-restaurant
```

2. Đảm bảo có đủ thư mục:

- `frontend/` – mã React  
- `backend/src/API/` – mã ASP.NET Core  
- `Database/` – hướng dẫn DB  
- `docs/` – tài liệu  

---

## 3.5 Cấu hình Backend (lần đầu)

1. Vào thư mục API:

```bash
cd backend/src/API
```

2. Sửa chuỗi kết nối (nếu không dùng LocalDB mặc định):

- **File:** `appsettings.json` hoặc `appsettings.Development.json`  
- **Section:** `ConnectionStrings` → `DefaultConnection`

Ví dụ LocalDB:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SmartPOSDb_Dev;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

Ví dụ SQL Server:

```json
"DefaultConnection": "Server=localhost;Database=SmartPOSDb;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
```

3. Khôi phục package:

```bash
dotnet restore
```

4. Tạo/cập nhật database:

```bash
dotnet ef database update
```

Chi tiết thêm: [Database/README.md](../../Database/README.md).

---

## 3.6 Cấu hình Frontend (lần đầu)

1. Vào thư mục frontend:

```bash
cd frontend
```

2. Tạo file môi trường (copy từ mẫu):

- **Windows (PowerShell):**

```powershell
Copy-Item env.example .env
```

- **Linux/macOS:**

```bash
cp env.example .env
```

3. Chỉnh `.env` nếu backend chạy khác cổng:

```env
VITE_API_URL=http://localhost:5000
# VITE_SIGNALR_URL=http://localhost:5000
```

4. Cài dependency:

```bash
npm install
```

---

## 3.7 Tóm tắt lệnh thiết lập một lần

**Backend:**

```bash
cd backend/src/API
dotnet restore
dotnet tool install --global dotnet-ef   # nếu chưa cài
dotnet ef database update
```

**Frontend:**

```bash
cd frontend
cp env.example .env   # hoặc Copy-Item env.example .env
npm install
```

Sau bước này có thể chạy ứng dụng theo [04-running-the-application.md](04-running-the-application.md).
