# Admin

Ứng dụng quản trị độc lập của Phongtro247, xây dựng bằng React, Vite, TypeScript và shadcn/ui.

## Chạy local

```bash
cd Admin
pnpm install
cp .env.example .env
pnpm dev
```

Admin chạy tại `http://localhost:5177`.

Các biến môi trường chính:

- `VITE_API_URL`: địa chỉ backend, mặc định `http://localhost:5000`.
- `VITE_PUBLIC_APP_URL`: địa chỉ website người dùng, mặc định `http://localhost:5176`.
- `VITE_APP_NAME`: tên hiển thị của ứng dụng.

## Kiểm tra và build

```bash
pnpm typecheck
pnpm build
```

Backend đã cho phép CORS từ cổng `5177`. Nếu đặt `CORS_ALLOWED_ORIGINS`, hãy bổ sung địa chỉ Admin vào biến môi trường đó.
