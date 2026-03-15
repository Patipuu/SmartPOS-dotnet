# 4. Cách chạy ứng dụng (Running the Application)

## 4.1 Chạy môi trường Development

Cần chạy **hai tiến trình**: Backend API và Frontend (Vite).

### 4.1.1 Chạy Backend

1. Mở terminal, vào thư mục API:

```bash
cd backend/src/API
```

2. Chạy:

```bash
dotnet run
```

- Ứng dụng đọc `appsettings.Development.json` khi `ASPNETCORE_ENVIRONMENT=Development` (mặc định).  
- Lần đầu chạy sẽ tự **seed** dữ liệu (Role, User admin, Menu, MenuItem, Table, Terminal) nếu database trống.  
- **API:** http://localhost:5000  
- **Swagger:** http://localhost:5000/swagger  

Dừng: `Ctrl+C`.

### 4.1.2 Chạy Frontend

1. Mở terminal **mới**, vào thư mục frontend:

```bash
cd frontend
```

2. Chạy dev server:

```bash
npm run dev
```

- **Ứng dụng web:** http://localhost:5173  
- Hot reload khi sửa mã nguồn.

Dừng: `Ctrl+C`.

### 4.1.3 Kiểm tra nhanh

1. Mở trình duyệt: http://localhost:5173  
2. Trang chủ: chọn vai trò (Khách hàng, Bếp, Thu ngân, Quản lý).  
3. **Khách hàng:** http://localhost:5173/customer – quét QR hoặc nhập mã bàn (T01, T02, T03 nếu đã seed).  
4. **Đăng nhập:** http://localhost:5173/login – user `admin`, mật khẩu `admin123`.  
5. Sau khi đăng nhập có thể vào Thu ngân, Bếp, Quản lý.

---

## 4.2 Build Production

### 4.2.1 Backend

```bash
cd backend/src/API
dotnet publish -c Release -o ./publish
```

Thư mục `publish/` chứa file chạy. Chạy:

```bash
./publish/API
# hoặc Windows: .\publish\API.exe
```

Khi chạy production, nên đặt biến môi trường `ASPNETCORE_ENVIRONMENT=Production` và cấu hình connection string, JWT phù hợp (xem [05-deployment.md](05-deployment.md)).

### 4.2.2 Frontend

```bash
cd frontend
npm run build
```

Kết quả nằm trong `frontend/dist/`. Có thể host thư mục này bằng bất kỳ web server tĩnh nào (IIS, Nginx, Apache) hoặc serve qua backend (static files).

Xem trước bản build (local):

```bash
npm run preview
```

---

## 4.3 Các lệnh hữu ích

| Việc | Lệnh |
|------|------|
| Restore backend | `cd backend/src/API && dotnet restore` |
| Chạy backend | `cd backend/src/API && dotnet run` |
| Tạo migration mới | `cd backend/src/API && dotnet ef migrations add TênMigration` |
| Cập nhật database | `cd backend/src/API && dotnet ef database update` |
| Cài frontend | `cd frontend && npm install` |
| Chạy frontend dev | `cd frontend && npm run dev` |
| Build frontend | `cd frontend && npm run build` |
| Lint frontend | `cd frontend && npm run lint` |

---

## 4.4 Xử lý lỗi thường gặp

- **Backend không kết nối được database:** Kiểm tra connection string, SQL Server/LocalDB đã chạy, đã chạy `dotnet ef database update`.  
- **Frontend không gọi được API:** Kiểm tra `VITE_API_URL` trong `.env` trùng với URL backend (ví dụ http://localhost:5000), CORS đã bật trên backend (chính sách AllowAll trong mẫu).  
- **SignalR lỗi kết nối:** Kiểm tra backend đang chạy, URL SignalR dùng cùng gốc với API (hoặc `VITE_SIGNALR_URL`).  
- **401 khi gọi API (sau khi đăng nhập):** Kiểm tra token được gửi trong header (AuthContext lưu token, api client gắn Bearer token).  
- **Không có dữ liệu menu/bàn:** Đảm bảo đã chạy backend ít nhất một lần để seed (database trống mới seed).
