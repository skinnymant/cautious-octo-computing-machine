'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

/**
 * Guest cart preview backed by localStorage. Item quantities are keyed by
 * product id. Full server-synced cart + checkout lives behind authentication
 * (POST /api/orders/checkout); this page bridges guests into that flow.
 */
export default function CartPage() {
  const [count, setCount] = useState(0);

  function refresh() {
    const raw = localStorage.getItem('cart');
    const cart: Record<string, number> = raw ? JSON.parse(raw) : {};
    setCount(Object.keys(cart).length);
  }

  useEffect(() => {
    refresh();
    window.addEventListener('cart:updated', refresh);
    return () => window.removeEventListener('cart:updated', refresh);
  }, []);

  function clear() {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart:updated'));
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold">Giỏ hàng</h1>

      {count === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link href="/" className="btn-primary mt-4">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white p-6">
          <p className="text-gray-700">
            Bạn có <b>{count}</b> sản phẩm trong giỏ. Đăng nhập để đồng bộ giỏ hàng
            và thanh toán (COD / chuyển khoản / VNPay / MoMo).
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tai-khoan" className="btn-primary">Đăng nhập để thanh toán</Link>
            <button onClick={clear} className="flex items-center gap-1 text-red-500">
              <Trash2 size={16} /> Xoá giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
