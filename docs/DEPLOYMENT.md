# Hướng dẫn triển khai — TechMart

## 1. Yêu cầu

- Docker Engine 24+ và Docker Compose v2
- (Production) VPS Linux 2 vCPU / 4GB RAM trở lên, mở cổng 80 & 443, một tên miền trỏ về IP server

## 2. Chạy môi trường Development

```bash
git clone <repo> techmart && cd techmart
cp .env.example .env
docker compose up -d --build
```

Khởi tạo schema + dữ liệu mẫu (500 sản phẩm, 50 thương hiệu, 20 bài viết):

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

> Lần đầu, nếu chưa có migration: `docker compose exec backend npx prisma migrate dev --name init`.

Đánh chỉ mục Elasticsearch (tuỳ chọn — search vẫn chạy nhờ fallback Postgres):

```bash
curl -X POST http://localhost/api/search/reindex
```

Truy cập:

| Dịch vụ        | URL                         |
|----------------|-----------------------------|
| Website        | http://localhost            |
| API + Swagger  | http://localhost/api/docs   |
| MinIO Console  | http://localhost:9001       |
| Adminer        | http://localhost:8081       |
| MailHog        | http://localhost:8025       |

## 3. Triển khai Production

1. Chuẩn bị server, cài Docker, clone repo vào `/opt/techmart`.
2. Tạo `.env` thật: đổi toàn bộ secret (`JWT_*`, mật khẩu DB/MinIO), đặt `DOMAIN=tenmien.com`, `NODE_ENV=production`, cập nhật `NEXT_PUBLIC_*` sang `https://tenmien.com`.
3. Khởi động:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed   # chỉ chạy 1 lần
```

### Cấp SSL Let's Encrypt

```bash
# Lần đầu phát hành chứng chỉ
docker compose run --rm certbot certonly --webroot \
  -w /var/www/certbot -d tenmien.com -d www.tenmien.com \
  --email admin@tenmien.com --agree-tos --no-eff-email
```

Sau đó bỏ comment block `server { listen 443 ssl ... }` trong
`nginx/conf.d/default.conf` (thay `${DOMAIN}` bằng tên miền), rồi:

```bash
docker compose restart nginx
```

Container `certbot` trong `docker-compose.prod.yml` tự gia hạn mỗi 12h.

## 4. CI/CD

`.github/workflows/ci.yml` chạy lint + build + test backend/frontend, build
Docker image, và (trên nhánh `main`) SSH vào server để `git pull` + rebuild.
Cấu hình secrets trong GitHub: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.

## 5. Sao lưu & vận hành

```bash
# Backup database
docker compose exec postgres pg_dump -U techmart techmart > backup_$(date +%F).sql

# Xem log
docker compose logs -f backend
docker compose logs -f frontend

# Cập nhật phiên bản
git pull && docker compose up -d --build
```

## 6. Tối ưu Core Web Vitals (đạt 95+ Lighthouse)

- Next.js standalone + ISR (`revalidate`) cho trang danh mục/sản phẩm/tin tức.
- `next/image` đặt `sizes`, container ảnh có `aspect-ratio` cố định → tránh CLS.
- Nginx bật gzip; cân nhắc thêm CDN (Cloudflare) cho ảnh tĩnh.
- Redis cache giảm thời gian phản hồi API → cải thiện LCP/INP.
