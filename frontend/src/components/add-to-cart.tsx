'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import type { Product } from '@/lib/types';

/** Lightweight client cart persisted to localStorage (guest-friendly). */
export function AddToCart({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  function add() {
    try {
      const raw = localStorage.getItem('cart');
      const cart: Record<string, number> = raw ? JSON.parse(raw) : {};
      cart[product.id] = (cart[product.id] ?? 0) + qty;
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart:updated'));
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded border">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">−</button>
        <input
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="w-12 border-x py-2 text-center outline-none"
          aria-label="Số lượng"
        />
        <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">+</button>
      </div>
      <button onClick={add} className="btn-accent flex-1" disabled={product.stock <= 0}>
        {added ? <Check size={18} /> : <ShoppingCart size={18} />}
        {added ? 'Đã thêm' : 'Thêm vào giỏ'}
      </button>
    </div>
  );
}
