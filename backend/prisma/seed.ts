import { PrismaClient, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Reference data ─────────────────────────────────────
const CATEGORIES = [
  { name: 'Máy hàn', icon: 'flame' },
  { name: 'Máy khoan', icon: 'drill' },
  { name: 'Máy cắt', icon: 'scissors' },
  { name: 'Máy mài', icon: 'disc' },
  { name: 'Thang nhôm', icon: 'ladder' },
  { name: 'Dụng cụ cầm tay', icon: 'wrench' },
  { name: 'Thiết bị đo', icon: 'ruler' },
  { name: 'Máy nén khí', icon: 'wind' },
];

const NAMED_BRANDS = [
  'Makita',
  'Bosch',
  'Dewalt',
  'Total',
  'Ingco',
  'Stanley',
  'Milwaukee',
];

const PRODUCT_PREFIX: Record<string, string[]> = {
  'Máy hàn': ['Máy hàn que', 'Máy hàn TIG', 'Máy hàn MIG', 'Máy hàn điện tử'],
  'Máy khoan': ['Máy khoan động lực', 'Máy khoan pin', 'Máy khoan bê tông', 'Máy khoan từ'],
  'Máy cắt': ['Máy cắt sắt', 'Máy cắt gạch', 'Máy cắt cỏ', 'Máy cắt cầm tay'],
  'Máy mài': ['Máy mài góc', 'Máy mài thẳng', 'Máy mài khuôn', 'Máy mài hai đá'],
  'Thang nhôm': ['Thang nhôm rút', 'Thang nhôm chữ A', 'Thang nhôm ghế', 'Thang nhôm gấp'],
  'Dụng cụ cầm tay': ['Bộ tua vít', 'Cờ lê lực', 'Kìm đa năng', 'Búa nhổ đinh'],
  'Thiết bị đo': ['Máy đo khoảng cách', 'Máy cân mực laser', 'Đồng hồ vạn năng', 'Thước kẹp điện tử'],
  'Máy nén khí': ['Máy nén khí 24L', 'Máy nén khí 50L', 'Máy nén khí không dầu', 'Máy nén khí trục vít'],
};

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // ─── Admin + sample users ──────────────────────────────
  const adminHash = await argon2.hash('Admin@123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techmart.vn' },
    update: {},
    create: {
      email: 'admin@techmart.vn',
      passwordHash: adminHash,
      fullName: 'Quản trị viên',
      role: 'ADMIN',
    },
  });

  const dealerHash = await argon2.hash('Dealer@123');
  await prisma.user.upsert({
    where: { email: 'dealer@techmart.vn' },
    update: {},
    create: {
      email: 'dealer@techmart.vn',
      passwordHash: dealerHash,
      fullName: 'Công ty TNHH Xây Dựng An Phát',
      role: 'DEALER',
      companyName: 'Công ty TNHH Xây Dựng An Phát',
      taxCode: '0312345678',
    },
  });

  // ─── Categories (with subcategories) ───────────────────
  const categoryIds: string[] = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const parent = await prisma.category.upsert({
      where: { slug: slugify(c.name) },
      update: {},
      create: {
        name: c.name,
        slug: slugify(c.name),
        icon: c.icon,
        position: i,
        metaTitle: `${c.name} chính hãng — TechMart`,
        metaDescription: `Mua ${c.name} chính hãng, giá tốt, bảo hành toàn quốc tại TechMart.`,
      },
    });
    categoryIds.push(parent.id);
    // one child per parent for multi-level demo
    const childName = `${c.name} chuyên dụng`;
    await prisma.category.upsert({
      where: { slug: slugify(childName) },
      update: {},
      create: {
        name: childName,
        slug: slugify(childName),
        parentId: parent.id,
        position: 0,
      },
    });
  }

  // ─── Brands (50) ───────────────────────────────────────
  const brandIds: string[] = [];
  for (let i = 0; i < 50; i++) {
    const name = i < NAMED_BRANDS.length ? NAMED_BRANDS[i] : `Brand ${i + 1}`;
    const slug = slugify(name);
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        featured: i < NAMED_BRANDS.length,
        position: i,
        logoUrl: `https://placehold.co/200x80?text=${encodeURIComponent(name)}`,
        description: `Thương hiệu ${name} — thiết bị & dụng cụ công nghiệp chính hãng.`,
      },
    });
    brandIds.push(brand.id);
  }

  // ─── Products (500) ────────────────────────────────────
  console.log('🛠  Tạo 500 sản phẩm...');
  const existing = await prisma.product.count();
  if (existing < 500) {
    for (let i = existing; i < 500; i++) {
      const cat = CATEGORIES[i % CATEGORIES.length];
      const categoryId = categoryIds[i % categoryIds.length];
      const brandId = pick(brandIds);
      const prefix = pick(PRODUCT_PREFIX[cat.name]);
      const model = `${pick(['Pro', 'Max', 'Plus', 'Eco', 'X', 'S'])}${randInt(100, 999)}`;
      const name = `${prefix} ${model}`;
      const slug = `${slugify(name)}-${i}`;
      const price = randInt(50, 2000) * 10_000;
      const hasSale = Math.random() < 0.3;
      const salePrice = hasSale ? Math.round(price * 0.85) : null;

      await prisma.product.create({
        data: {
          name,
          slug,
          sku: `SKU-${String(i).padStart(5, '0')}`,
          shortDesc: `${name} — công suất mạnh, bền bỉ, phù hợp công trình & xưởng sản xuất.`,
          description: `<p>${name} là dòng sản phẩm chất lượng cao, được nhập khẩu và phân phối chính hãng tại TechMart. Bảo hành 12 tháng, hỗ trợ kỹ thuật trọn đời.</p>`,
          price: new Prisma.Decimal(price),
          salePrice: salePrice ? new Prisma.Decimal(salePrice) : null,
          stock: randInt(0, 200),
          unit: 'Cái',
          categoryId,
          brandId,
          isFeatured: Math.random() < 0.15,
          isNew: Math.random() < 0.2,
          soldCount: randInt(0, 500),
          ratingAvg: Number((Math.random() * 2 + 3).toFixed(1)),
          ratingCount: randInt(0, 120),
          specs: [
            { key: 'Công suất', value: `${randInt(500, 2500)}W` },
            { key: 'Điện áp', value: '220V' },
            { key: 'Xuất xứ', value: pick(['Nhật Bản', 'Đức', 'Trung Quốc', 'Việt Nam']) },
            { key: 'Bảo hành', value: '12 tháng' },
          ],
          metaTitle: `${name} chính hãng giá tốt`,
          metaDescription: `Mua ${name} chính hãng tại TechMart, giao nhanh toàn quốc.`,
          images: {
            create: [
              {
                url: `https://placehold.co/600x600?text=${encodeURIComponent(model)}`,
                alt: name,
                position: 0,
              },
            ],
          },
        },
      });
    }
  }

  // ─── Coupons ───────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: new Prisma.Decimal(10),
      minOrder: new Prisma.Decimal(500_000),
      maxDiscount: new Prisma.Decimal(200_000),
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: 'FREESHIP' },
    update: {},
    create: {
      code: 'FREESHIP',
      type: 'FIXED',
      value: new Prisma.Decimal(30_000),
      minOrder: new Prisma.Decimal(300_000),
      isActive: true,
    },
  });

  // ─── Article categories + 20 articles ──────────────────
  const artCats = ['Kiến thức kỹ thuật', 'Hướng dẫn sử dụng', 'Tin khuyến mãi'];
  const artCatIds: string[] = [];
  for (const name of artCats) {
    const c = await prisma.articleCategory.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    artCatIds.push(c.id);
  }

  const tagNames = ['máy khoan', 'an toàn', 'bảo trì', 'makita', 'mẹo hay'];
  const tagIds: string[] = [];
  for (const t of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { slug: slugify(t) },
      update: {},
      create: { name: t, slug: slugify(t) },
    });
    tagIds.push(tag.id);
  }

  const articleCount = await prisma.article.count();
  if (articleCount < 20) {
    for (let i = articleCount; i < 20; i++) {
      const title = `Bài viết kỹ thuật số ${i + 1}: Cách chọn & bảo trì dụng cụ`;
      await prisma.article.create({
        data: {
          title,
          slug: `${slugify(title)}-${i}`,
          excerpt: 'Hướng dẫn chi tiết giúp bạn lựa chọn và sử dụng thiết bị hiệu quả, an toàn.',
          content: `<h2>${title}</h2><p>Nội dung chi tiết về cách lựa chọn, sử dụng và bảo trì thiết bị công nghiệp đúng cách để tăng tuổi thọ và đảm bảo an toàn lao động.</p>`,
          coverUrl: `https://placehold.co/800x450?text=Article+${i + 1}`,
          categoryId: pick(artCatIds),
          authorId: admin.id,
          metaTitle: title,
          metaDescription: 'Hướng dẫn kỹ thuật từ chuyên gia TechMart.',
          tags: { connect: [{ id: pick(tagIds) }] },
        },
      });
    }
  }

  // ─── Banners ───────────────────────────────────────────
  const banners = await prisma.banner.count();
  if (banners === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: 'Siêu sale dụng cụ điện',
          imageUrl: 'https://placehold.co/1600x500?text=Sieu+Sale',
          link: '/danh-muc/may-khoan',
          position: 0,
        },
        {
          title: 'Makita chính hãng',
          imageUrl: 'https://placehold.co/1600x500?text=Makita',
          link: '/thuong-hieu/makita',
          position: 1,
        },
        {
          title: 'Báo giá đại lý B2B',
          imageUrl: 'https://placehold.co/1600x500?text=B2B',
          link: '/bao-gia',
          position: 2,
        },
      ],
    });
  }

  console.log('✅ Seed hoàn tất.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
