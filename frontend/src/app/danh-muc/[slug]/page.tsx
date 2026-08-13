import { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { api } from '@/lib/api';
import type { Paginated, Product } from '@/lib/types';

export const revalidate = 120;

const SORTS = [
  { value: '', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name', label: 'Tên A-Z' },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ');
  return {
    title: `${title} chính hãng`,
    description: `Mua ${title} chính hãng, giá tốt, bảo hành toàn quốc tại TechMart.`,
    alternates: { canonical: `/danh-muc/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  let result: Paginated<Product> = {
    data: [],
    meta: { total: 0, page, limit: 20, totalPages: 0 },
  };
  try {
    result = await api.products({
      category: slug,
      page,
      limit: 20,
      ...(sp.sort ? { sort: sp.sort } : {}),
      ...(sp.minPrice ? { minPrice: sp.minPrice } : {}),
      ...(sp.maxPrice ? { maxPrice: sp.maxPrice } : {}),
    });
  } catch {
    /* backend may be warming up */
  }

  const title = slug.replace(/-/g, ' ');

  return (
    <div className="container-x py-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand">Trang chủ</Link>
        <span className="mx-2">/</span>
        <span className="capitalize text-gray-800">{title}</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{title}</h1>
        <form className="flex items-center gap-2 text-sm">
          <label htmlFor="sort">Sắp xếp:</label>
          <select
            id="sort"
            name="sort"
            defaultValue={sp.sort ?? ''}
            className="rounded border px-2 py-1"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button className="rounded bg-brand px-3 py-1 text-white">Áp dụng</button>
        </form>
      </div>

      <p className="mt-1 text-sm text-gray-500">{result.meta.total} sản phẩm</p>

      {result.data.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Chưa có sản phẩm trong danh mục này.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {result.data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result.meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1)
            .slice(0, 10)
            .map((p) => (
              <Link
                key={p}
                href={`/danh-muc/${slug}?page=${p}`}
                className={`rounded border px-3 py-1 text-sm ${
                  p === page ? 'bg-brand text-white' : 'bg-white hover:border-brand'
                }`}
              >
                {p}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
