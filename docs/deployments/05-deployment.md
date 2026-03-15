# 5. Triển khai (Deployment)

## 5.1 Tổng quan

Triển khai production thường gồm:

- **Backend:** Chạy trên máy chủ Windows/Linux với .NET runtime, phía trước có thể đặt reverse proxy (IIS, Nginx).  
- **Frontend:** Build thành file tĩnh, host trên web server hoặc serve qua backend.  
- **Database:** SQL Server (hoặc tương thích) trên server riêng hoặc cùng server.  
- **HTTPS:** Nên dùng SSL/TLS (certificate) cho cả API và web.

---

## 5.2 Biến môi trường và cấu hình

### 5.2.1 Backend (ASP.NET Core)

Cấu hình qua `appsettings.json`, `appsettings.Production.json`, hoặc biến môi trường.

**Connection string (bắt buộc):**

- Trên server không dùng `appsettings.Production.json` có thể đặt:

```bash
# Linux/macOS
export ConnectionStrings__DefaultConnection="Server=.;Database=SmartPOSDb;User Id=user;Password=pass;TrustServerCertificate=True;"

# Windows (PowerShell)
$env:ConnectionStrings__DefaultConnection="Server=.;Database=SmartPOSDb;User Id=user;Password=pass;TrustServerCertificate=True;"
```

**JWT (nên đổi trong production):**

- Trong `appsettings.json` (hoặc biến môi trường):

```json
"Jwt": {
  "Key": "Chuoi-bi-mat-du-dai-it-nhat-32-ky-tu-thay-doi-trong-production",
  "Issuer": "SmartPOS",
  "Audience": "SmartPOS",
  "ExpiryMinutes": 480
}
```

- Có thể đặt qua biến môi trường: `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`, `Jwt__ExpiryMinutes`.

**Môi trường:**

- Đặt `ASPNETCORE_ENVIRONMENT=Production` để tắt Swagger ở môi trường production (hoặc giới hạn theo điều kiện trong code).

### 5.2.2 Frontend (Build time)

Các biến **VITE_*** phải có lúc build (ví dụ `npm run build`), không đọc được lúc runtime từ file `.env` trên server.

- **Cách 1 – Build với URL production:**

Tạo `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_SIGNALR_URL=https://api.yourdomain.com
```

Rồi chạy:

```bash
cd frontend
npm run build
```

- **Cách 2 – Build một lần, cấu hình runtime:** Cần cơ chế inject base URL vào window hoặc file config được load khi khởi động (tùy cách bạn thiết kế). Mặc định dự án dùng `import.meta.env.VITE_API_URL` nên URL cố định tại lúc build.

---

## 5.3 Database Production

1. **Backup** database hiện tại (nếu có).  
2. Trên server production:
   - Cài .NET runtime (và nếu cần: EF tools) hoặc copy sẵn migrations từ máy dev.
   - Chỉnh connection string trỏ tới SQL Server production.
3. Chạy migrations (một lần hoặc khi có migration mới):

```bash
dotnet ef database update
```

Hoặc chạy từ thư mục đã publish (nếu có tools):

```bash
dotnet ef database update --project backend/src/API
```

4. **Không** nên dùng seed tự động tạo user admin trên production nếu đã có dữ liệu; có thể tắt seed khi `Users` đã có bản ghi (logic hiện tại trong DbSeeder đã kiểm tra điều này).

---

## 5.4 Reverse proxy (Nginx / IIS)

### 5.4.1 Nginx – API + SignalR

Ví dụ upstream cho API và WebSocket:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Cổng 5000 là nơi backend đang lắng nghe (có thể đổi trong `launchSettings.json` hoặc khi chạy `dotnet run`).

### 5.4.2 Phục vụ Frontend (static)

- Build: `cd frontend && npm run build`.  
- Copy nội dung `frontend/dist/` vào thư mục web (ví dụ `/var/www/smartpos`).  
- Cấu hình Nginx/Apache trỏ root tới thư mục đó; với SPA cần fallback về `index.html` cho mọi route (try_files với index.html).

---

## 5.5 Bảo mật khuyến nghị

- **HTTPS:** Dùng certificate (Let’s Encrypt hoặc certificate công ty) cho cả API và web.  
- **JWT Key:** Đổi key mạnh, dài (≥ 32 ký tự), không commit vào repo; dùng biến môi trường hoặc secret store.  
- **Connection string:** Không commit mật khẩu; dùng biến môi trường hoặc Azure Key Vault / vault tương đương.  
- **CORS:** Trong production thu hẹp `AllowAnyOrigin` thành danh sách domain frontend cụ thể.  
- **Swagger:** Tắt hoặc chỉ bật trong môi trường Development (điều kiện theo `ASPNETCORE_ENVIRONMENT`).  
- **Đổi mật khẩu admin:** Sau lần đầu đăng nhập production, đổi mật khẩu user admin (khi chức năng đổi mật khẩu đã có).

---

## 5.6 Checklist triển khai

- [ ] Cài .NET runtime (và nếu cần EF tools) trên server.  
- [ ] Cấu hình connection string production, chạy `dotnet ef database update`.  
- [ ] Đặt `ASPNETCORE_ENVIRONMENT=Production`.  
- [ ] Đổi JWT Key (và kiểm tra Issuer/Audience nếu cần).  
- [ ] Build frontend với `VITE_API_URL` (và `VITE_SIGNALR_URL`) trỏ tới domain API production.  
- [ ] Cấu hình reverse proxy (HTTPS, WebSocket cho SignalR).  
- [ ] Thu hẹp CORS, tắt hoặc giới hạn Swagger.  
- [ ] Kiểm tra đăng nhập, gọi API, SignalR (đơn realtime) qua domain production.  
- [ ] Backup database và có quy trình cập nhật migration khi nâng cấp phiên bản.
