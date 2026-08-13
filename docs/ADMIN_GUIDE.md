# Hướng dẫn quản trị — TechMart

## Đăng nhập admin

Tài khoản mặc định sau khi seed:

| Vai trò | Email                | Mật khẩu    |
|---------|----------------------|-------------|
| Admin   | admin@techmart.vn    | `Admin@123` |
| Đại lý  | dealer@techmart.vn   | `Dealer@123`|

> Đổi mật khẩu admin ngay trong môi trường production.

Đăng nhập qua API: `POST /api/auth/login` → nhận `accessToken` (Bearer) dùng cho các endpoint quản trị. Toàn bộ API quản trị yêu cầu vai trò `ADMIN` hoặc `STAFF` (RBAC).

## Phân quyền (RBAC)

| Vai trò    | Quyền |
|------------|-------|
| `CUSTOMER` | Mua hàng, đánh giá, yêu thích |
| `DEALER`   | Như customer + báo giá B2B, giá đại lý |
| `STAFF`    | Quản lý sản phẩm/danh mục/đơn hàng/báo giá/tin tức |
| `ADMIN`    | Toàn quyền + quản lý người dùng, xoá dữ liệu |

## Nghiệp vụ quản trị (qua API / CMS)

| Nhóm | Endpoint chính |
|------|----------------|
| Dashboard | tổng hợp doanh thu, đơn hàng, người dùng, top sản phẩm (truy vấn các API thống kê) |
| Danh mục  | `POST/PATCH/DELETE /api/categories` |
| Thương hiệu | `POST/PATCH/DELETE /api/brands` |
| Sản phẩm  | `POST/PATCH/DELETE /api/products` |
| Đơn hàng  | `GET /api/orders/admin/all`, `PATCH /api/orders/admin/:id/status` |
| Báo giá   | `GET /api/quotes/admin/all`, `PATCH /api/quotes/admin/:id/status` |
| Tin tức   | `POST/PATCH/DELETE /api/articles` |
| Người dùng| `GET /api/users` (ADMIN) |
| Coupon/Banner/Popup | quản lý qua bảng tương ứng trong Prisma/CMS |

## Trạng thái đơn hàng

`PENDING → CONFIRMED → PROCESSING → SHIPPING → COMPLETED` (hoặc `CANCELLED`).
Đơn COD/chuyển khoản tự chuyển `CONFIRMED`; đơn VNPay/MoMo giữ `PENDING` đến khi nhận IPN callback thành công.

## Quản lý báo giá B2B

`NEW → PROCESSING → QUOTED → CLOSED`. Mỗi yêu cầu có mã `QT...`, danh sách sản phẩm và file đính kèm (nếu có).

## Tìm kiếm & AI

- Re-index Elasticsearch sau khi nhập liệu lớn: `POST /api/search/reindex`.
- Bật AI thật: đặt `ANTHROPIC_API_KEY` trong `.env`. Không có key, AI dùng heuristic nội bộ (vẫn hoạt động).

## Tài liệu API đầy đủ

Swagger UI: `http://localhost/api/docs` — thử nghiệm trực tiếp mọi endpoint, kèm schema request/response.
