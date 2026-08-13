import Link from 'next/link';
import { Hero } from '@/components/hero';
import { CategoryGrid, BrandStrip, ProductRow } from '@/components/sections';
import { api } from '@/lib/api';
import type { Article, Product } from '@/lib/types';

export const revalidate = 120;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const empty = { data: [], meta: { total: 0, page: 1, limit: 0, totalPages: 0 } };
  const [bestseller, sale, fresh, articles] = await Promise.all([
    safe<{ data: Product[] }>(api.products({ tag: 'bestseller', limit: 10 }), empty),
    safe<{ data: Product[] }>(api.products({ tag: 'sale', limit: 10 }), empty),
    safe<{ data: Product[] }>(api.products({ tag: 'new', limit: 10 }), empty),
    safe<{ data: Article[] }>(api.articles({ limit: 4 }), empty),
  ]);

  return (
    <>
      <Hero />
      <CategoryGrid />
      <BrandStrip />

      <ProductRow title="Sản phẩm bán chạy" href="/danh-muc/may-khoan" products={bestseller.data} />
      <ProductRow title="Khuyến mãi hot" href="/khuyen-mai" products={sale.data} />
      <ProductRow title="Sản phẩm mới" href="/san-pham-moi" products={fresh.data} />

      {/* News */}
      <section className="container-x py-8">
        <div className="mb-4 flex items-center justify-between border-l-4 border-accent pl-3">
          <h2 className="text-xl font-bold sm:text-2xl">Tin tức kỹ thuật</h2>
          <Link href="/tin-tuc" className="text-sm text-brand hover:underline">Xem tất cả</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {articles.data.map((a) => (
            <Link key={a.id} href={`/tin-tuc/${a.slug}`} className="overflow-hidden rounded-lg border bg-white transition hover:shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.coverUrl} alt={a.title} className="h-40 w-full object-cover" width={400} height={225} />
              <div className="p-3">
                <h3 className="line-clamp-2 font-medium text-gray-800">{a.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dealer CTA */}
      <section className="bg-brand">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-10 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold">Trở thành đại lý TechMart</h2>
            <p className="mt-1 text-blue-100">Chiết khấu hấp dẫn, công nợ linh hoạt, hỗ trợ marketing.</p>
          </div>
          <Link href="/dai-ly" className="btn-accent shrink-0">Đăng ký ngay</Link>
        </div>
      </section>
    </>
  );
}
