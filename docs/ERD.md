# ERD — TechMart Database

```mermaid
erDiagram
    User ||--o{ Address : has
    User ||--o{ Order : places
    User ||--o{ QuoteRequest : requests
    User ||--o{ Review : writes
    User ||--o{ Question : asks
    User ||--o{ WishlistItem : saves
    User ||--o{ Article : authors

    Category ||--o{ Category : "parent/child"
    Category ||--o{ Product : contains

    Brand ||--o{ Product : owns

    Product ||--o{ ProductImage : has
    Product ||--o{ ProductVariant : has
    Product ||--o{ Review : receives
    Product ||--o{ Question : receives
    Product ||--o{ WishlistItem : in
    Product ||--o{ OrderItem : in
    Product ||--o{ QuoteItem : in
    Product ||--o{ CartItem : in

    Cart ||--o{ CartItem : contains
    User ||--o| Cart : owns

    Order ||--o{ OrderItem : contains
    Order ||--o| Payment : has
    Order }o--|| Coupon : "may use"

    QuoteRequest ||--o{ QuoteItem : contains

    ArticleCategory ||--o{ Article : groups
    Article }o--o{ Tag : tagged

    User {
        string id PK
        string email UK
        string passwordHash
        string fullName
        string phone
        enum   role
        string companyName "B2B"
        string taxCode "B2B"
        bool   isActive
        datetime createdAt
    }
    Category {
        string id PK
        string name
        string slug UK
        string parentId FK
        string icon
        int    position
    }
    Brand {
        string id PK
        string name
        string slug UK
        string logoUrl
        bool   featured
    }
    Product {
        string id PK
        string name
        string slug UK
        string sku UK
        text   description
        decimal price
        decimal salePrice
        int    stock
        string categoryId FK
        string brandId FK
        bool   isActive
        bool   isFeatured
        bool   isNew
        int    soldCount
        float  ratingAvg
        json   specs
        datetime createdAt
    }
    Order {
        string id PK
        string code UK
        string userId FK
        enum   status
        enum   paymentMethod
        decimal subtotal
        decimal discount
        decimal shippingFee
        decimal total
        string couponId FK
        datetime createdAt
    }
    QuoteRequest {
        string id PK
        string code UK
        string userId FK
        string contactName
        string contactPhone
        string contactEmail
        text   note
        string fileUrl "Excel/ảnh"
        enum   status
        datetime createdAt
    }
```

## Bảng chính

| Bảng | Mô tả |
|------|-------|
| **User** | Khách lẻ (B2C), đại lý (B2B), nhân viên, admin. Có `companyName`, `taxCode` cho B2B. |
| **Category** | Danh mục đa cấp (self-relation `parentId`). |
| **Brand** | Thương hiệu (Makita, Bosch, Dewalt...). |
| **Product** | Sản phẩm, `specs` dạng JSON, `salePrice` cho khuyến mãi, cờ `isFeatured/isNew`. |
| **ProductVariant** | Biến thể (màu, công suất, điện áp...). |
| **Cart / CartItem** | Giỏ hàng gắn user. |
| **Order / OrderItem** | Đơn hàng + chi tiết. |
| **Payment** | Giao dịch COD / chuyển khoản / VNPay / MoMo. |
| **Coupon** | Mã giảm giá (%, cố định, theo điều kiện). |
| **QuoteRequest / QuoteItem** | Yêu cầu báo giá B2B (chọn nhiều sản phẩm / upload Excel). |
| **Review / Question** | Đánh giá & hỏi đáp sản phẩm. |
| **WishlistItem** | Danh sách yêu thích. |
| **Article / ArticleCategory / Tag** | Tin tức kỹ thuật + SEO. |
| **Banner / Popup** | Quản lý hiển thị trang chủ. |

Định nghĩa đầy đủ: [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).
