# TechMart — Nền tảng Thương mại điện tử B2B/B2C

Nền tảng TMĐT hiện đại cho thiết bị & dụng cụ công nghiệp (tương tự ketnoitieudung.vn nhưng nhanh hơn, chuẩn SEO 2026, tối ưu chuyển đổi).

## Tech Stack

| Tầng        | Công nghệ                                                        |
|-------------|------------------------------------------------------------------|
| Frontend    | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend     | NestJS, TypeScript, REST API, JWT Auth, Swagger                  |
| Database    | PostgreSQL 16 + Prisma ORM                                       |
| Cache       | Redis 7                                                          |
| Search      | Elasticsearch 8                                                  |
| Storage     | MinIO (S3-compatible)                                            |
| Hạ tầng     | Docker Compose, Nginx Reverse Proxy, Let's Encrypt SSL          |
| CI/CD       | GitHub Actions                                                   |

## Chạy nhanh (Development)

```bash
cp .env.example .env
docker compose up -d
```

Backend tự tạo bảng từ `schema.prisma` khi khởi động. Sau khi các container
đã "healthy" (đợi ~30–60s), nạp dữ liệu mẫu (500 SP, 50 thương hiệu, 20 bài viết):

```bash
docker compose exec backend npm run seed
```

| Dịch vụ            | URL                              |
|--------------------|----------------------------------|
| Website (Frontend) | http://localhost                 |
| API (Backend)      | http://localhost/api             |
| Swagger Docs       | http://localhost/api/docs        |
| MinIO Console      | http://localhost:9001            |
| Adminer (DB UI)    | http://localhost:8081            |

Tài khoản admin mẫu (sau khi seed): `admin@techmart.vn` / `Admin@123`

## Cấu trúc thư mục

```
.
├── backend/            # NestJS API
├── frontend/           # Next.js 15 storefront + admin
├── nginx/              # Reverse proxy config
├── docs/               # Kiến trúc, ERD, hướng dẫn
├── .github/workflows/  # CI/CD
└── docker-compose.yml
```

## Tài liệu

- [Kiến trúc hệ thống](docs/ARCHITECTURE.md)
- [ERD Database](docs/ERD.md)
- [Hướng dẫn triển khai](docs/DEPLOYMENT.md)
- [Hướng dẫn người dùng](docs/USER_GUIDE.md)
- [Hướng dẫn quản trị](docs/ADMIN_GUIDE.md)
