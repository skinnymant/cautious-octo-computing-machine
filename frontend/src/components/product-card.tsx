import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn, discountPercent, formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const discount = discountPercent(price, salePrice);
  const img = product.images?.[0]?.url ?? 'https://placehold.co/600x600?text=No+Image';

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-product bg-white">
        <Image
          src={img}
          alt={product.images?.[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-contain p-2 transition group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.isNew && (
          <span className="absolute right-2 top-2 rounded bg-brand px-2 py-0.5 text-xs font-bold text-white">
            Mới
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        {product.brand?.name && (
          <span className="text-xs text-gray-400">{product.brand.name}</span>
        )}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800 group-hover:text-brand">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-accent">
              {formatPrice(salePrice ?? price)}
            </span>
            {salePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-0.5">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              {product.ratingAvg?.toFixed(1) ?? '5.0'}
            </span>
            <span className={cn(product.stock > 0 ? 'text-green-600' : 'text-red-500')}>
              {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
