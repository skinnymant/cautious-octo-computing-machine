# Cấu trúc thư mục — TechMart

```
.
├── docker-compose.yml            # Dev: tất cả dịch vụ
├── docker-compose.prod.yml       # Override production + certbot
├── .env.example
├── README.md
│
├── .github/workflows/ci.yml      # CI/CD: lint, build, test, deploy
│
├── nginx/
│   ├── nginx.conf                # gzip, rate-limit, log
│   └── conf.d/default.conf       # reverse proxy + SSL block
│
├── docs/
│   ├── ARCHITECTURE.md           # Sơ đồ kiến trúc hệ thống
│   ├── ERD.md                    # Sơ đồ ERD database
│   ├── FOLDER_STRUCTURE.md
│   ├── DEPLOYMENT.md
│   ├── USER_GUIDE.md
│   └── ADMIN_GUIDE.md
│
├── backend/                      # NestJS API
│   ├── Dockerfile                # multi-stage: dev / build / prod
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma         # Toàn bộ data model
│   │   └── seed.ts               # 500 SP · 50 brand · 20 bài viết · coupon · banner
│   └── src/
│       ├── main.ts               # bootstrap, Swagger, helmet, CORS
│       ├── app.module.ts
│       ├── prisma/               # PrismaService (global)
│       ├── common/               # decorators, guards (JWT/RBAC), pagination
│       ├── auth/                 # register, login, refresh, logout
│       ├── users/                # profile, address, wishlist
│       ├── categories/           # danh mục đa cấp
│       ├── brands/               # thương hiệu
│       ├── products/             # lọc, phân trang, liên quan, so sánh
│       ├── cart/                 # giỏ hàng
│       ├── orders/               # checkout, coupon, COD/VNPay/MoMo
│       ├── quotes/               # báo giá B2B + email
│       ├── articles/             # blog/tin tức SEO
│       ├── search/               # Elasticsearch + AI (search/recommend/chat/quote)
│       └── health/               # health check
│
└── frontend/                     # Next.js 15 (App Router)
    ├── Dockerfile                # multi-stage standalone
    ├── next.config.js · tailwind.config.ts · tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx        # header/footer, Organization JSON-LD
        │   ├── page.tsx          # Trang chủ (hero, danh mục, brand, SP, tin tức, CTA)
        │   ├── globals.css
        │   ├── sitemap.ts        # sitemap.xml động
        │   ├── robots.ts         # robots.txt động
        │   ├── not-found.tsx
        │   ├── danh-muc/[slug]/  # listing + lọc + phân trang
        │   ├── san-pham/[slug]/  # chi tiết + Product JSON-LD
        │   ├── tin-tuc/          # danh sách + [slug] chi tiết (Article JSON-LD)
        │   ├── bao-gia/          # form báo giá nhanh
        │   ├── tim-kiem/         # kết quả tìm kiếm
        │   ├── gio-hang/         # giỏ hàng
        │   └── tai-khoan/        # đăng nhập / đăng ký
        ├── components/           # header, footer, hero, sections,
        │                         # product-card, add-to-cart, ai-chat-widget
        └── lib/                  # api client, types, utils
```
