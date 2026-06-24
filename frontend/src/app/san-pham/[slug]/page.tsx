import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { AddToCart } from '@/components/add-to-cart';
import { ProductCard } from '@/components/product-card';
import { api } from '@/lib/api';
import { formatPrice, discountPercent } from '@/lib/utils';
import type { Product } from '@/lib/types';

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await api.product(slug);
    return {
      title: p.name,
      description: p.shortDesc ?? p.name,
      alternates: { canonical: `/san-pham/${slug}` },
      openGraph: {
        title: p.name,
        images: p.images?.[0]?.url ? [p.images[0].url] : [],
      },
    };
  } catch {
    return { title: 'Sản phẩm' };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product;
  try {
    product = await api.product(slug);
  } catch {
    notFound();
  }

  const price = Number(product!.price);
  const salePrice = product!.salePrice ? Number(product!.salePrice) : null;
  const discount = discountPercent(price, salePrice);
  const img = product!.images?.[0]?.url ?? 'https://placehold.co/600x600';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product!.name,
    image: product!.images?.map((i) => i.url),
    description: product!.shortDesc,
    sku: product!.sku,
    brand: { '@type': 'Brand', name: product!.brand?.name },
    aggregateRating: product!.ratingCount
      ? {
          '@type': 'AggregateRating',
          ratingValue: product!.ratingAvg,
          reviewCount: product!.ratingCount,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: salePrice ?? price,
      priceCurrency: 'VND',
      availability:
        product!.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="container-x py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand">Trang chủ</Link>
        <span className="mx-2">/</span>
        {product!.category && (
          <>
            <Link href={`/danh-muc/${product!.category.slug}`} className="hover:text-brand">
              {product!.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-800">{product!.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square rounded-lg border bg-white">
          <Image src={img} alt={product!.name} fill className="object-contain p-4" priority />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded bg-accent px-2 py-1 text-sm font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product!.name}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {product!.ratingAvg?.toFixed(1) ?? '5.0'} ({product!.ratingCount ?? 0})
            </span>
            <span>Đã bán {product!.soldCount ?? 0}</span>
            <span>SKU: {product!.sku}</span>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-accent">
                {formatPrice(salePrice ?? price)}
              </span>
              {salePrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(price)}</span>
              )}
            </div>
          </div>

          <p className="mt-4 text-gray-600">{product!.shortDesc}</p>

          <div className="mt-6">
            <AddToCart product={product!} />
          </div>

          <Link href="/bao-gia" className="mt-3 inline-block text-sm text-brand hover:underline">
            Mua số lượng lớn? Yêu cầu báo giá B2B →
          </Link>

          <ul className="mt-6 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck size={16} className="text-brand" /> Giao toàn quốc</li>
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand" /> Bảo hành 12 tháng</li>
            <li className="flex items-center gap-2"><RotateCcw size={16} className="text-brand" /> Đổi trả 7 ngày</li>
          </ul>
        </div>
      </div>

      {/* Specs + description */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-xl font-bold">Mô tả sản phẩm</h2>
          <div
            className="prose max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product!.description ?? '' }}
          />
        </div>
        <div>
          <h2 className="mb-3 text-xl font-bold">Thông số kỹ thuật</h2>
          <table className="w-full text-sm">
            <tbody>
              {product!.specs?.map((s, i) => (
                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                  <td className="px-3 py-2 font-medium text-gray-500">{s.key}</td>
                  <td className="px-3 py-2">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related */}
      {product!.related && product!.related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 border-l-4 border-accent pl-3 text-xl font-bold">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {product!.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
