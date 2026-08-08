# Trọ Mới – Next.js frontend

Đây là frontend Next.js chạy song song với ứng dụng React/Vite cũ trong `../frontend`.

## Chạy local

```bash
npm install
copy .env.example .env.local
npm run dev
```

Mặc định app chạy tại `http://localhost:5176` và gọi backend hiện tại qua `NEXT_PUBLIC_API_URL`.

## Trạng thái migrate

- Đã chuyển toàn bộ route của app người dùng sang App Router.
- UI được tổ chức theo `src/components`, `src/features`, `src/providers`, `src/lib` và `src/hooks`.
- Đã chuyển các trang public, listing, video, auth result, account và landlord dashboard.
- Đã có providers cho User/Favorites/Google OAuth/Toast.
- Chưa xoá hoặc thay đổi frontend Vite cũ.
- `admin/` vẫn là app độc lập, chưa nằm trong phạm vi migrate lần này.
- Bước tiếp theo là thay dần router-compat và các API hard-code bằng module Next/API client typed.
