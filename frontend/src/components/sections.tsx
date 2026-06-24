import Link from 'next/link';
import {
  Flame,
  Drill,
  Scissors,
  Disc,
  Wrench,
  Ruler,
  Wind,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';

const CATEGORY_ICONS: { name: string; slug: string; Icon: LucideIcon }[] = [
  { name: 'Máy hàn', slug: 'may-han', Icon: Flame },
  { name: 'Máy khoan', slug: 'may-khoan', Icon: Drill },
  { name: 'Máy cắt', slug: 'may-cat', Icon: Scissors },
  { name: 'Máy mài', slug: 'may-mai', Icon: Disc },
  { name: 'Thang nhôm', slug: 'thang-nhom', Icon: ChevronRight },
  { name: 'Dụng cụ cầm tay', slug: 'dung-cu-cam-tay', Icon: Wrench },
  { name: 'Thiết bị đo', slug: 'thiet-bi-do', Icon: Ruler },
  { name: 'Máy nén khí', slug: 'may-nen-khi', Icon: Wind },
];

export function SectionTitle({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between border-l-4 border-accent pl-3">
      <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center text-sm text-brand hover:underline">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

export function CategoryGrid() {
  return (
    <section className="container-x py-8">
      <SectionTitle title="Danh mục nổi bật" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {CATEGORY_ICONS.map(({ name, slug, Icon }) => (
          <Link
            key={slug}
            href={`/danh-muc/${slug}`}
            className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4 text-center transition hover:border-brand hover:shadow"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
              <Icon size={24} />
            </span>
            <span className="text-xs font-medium text-gray-700">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const BRANDS = [
  'Makita',
  'Bosch',
  'Dewalt',
  'Total',
  'Ingco',
  'Stanley',
  'Milwaukee',
];

export function BrandStrip() {
  return (
    <section className="container-x py-8">
      <SectionTitle title="Thương hiệu nổi bật" href="/thuong-hieu" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {BRANDS.map((b) => (
          <Link
            key={b}
            href={`/thuong-hieu/${b.toLowerCase()}`}
            className="flex h-16 items-center justify-center rounded-lg border bg-white font-bold text-gray-600 transition hover:border-brand hover:text-brand"
          >
            {b}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProductRow({
  title,
  href,
  products,
}: {
  title: string;
  href?: string;
  products: Product[];
}) {
  if (!products?.length) return null;
  return (
    <section className="container-x py-6">
      <SectionTitle title={title} href={href} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 10).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
