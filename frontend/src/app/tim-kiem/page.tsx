import { Metadata } from 'next';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Tìm kiếm',
  robots: { index: false },
};

const SERVER_API = process.env.INTERNAL_API_URL ?? 'http://backend:4000';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  let results: Product[] = [];
  if (q) {
    try {
      const res = await fetch(
        `${SERVER_API}/products?q=${encodeURIComponent(q)}&limit=30`,
        { cache: 'no-store' },
      );
      const data = await res.json();
      results = data.data ?? [];
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-xl font-bold">
        Kết quả tìm kiếm cho “{q}” <span className="text-gray-400">({results.length})</span>
      </h1>
      {results.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
