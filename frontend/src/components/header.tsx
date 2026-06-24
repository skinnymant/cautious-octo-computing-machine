'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Search,
  Phone,
  ShoppingCart,
  User,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MEGA_CATEGORIES = [
  { name: 'Máy hàn', slug: 'may-han' },
  { name: 'Máy khoan', slug: 'may-khoan' },
  { name: 'Máy cắt', slug: 'may-cat' },
  { name: 'Máy mài', slug: 'may-mai' },
  { name: 'Thang nhôm', slug: 'thang-nhom' },
  { name: 'Dụng cụ cầm tay', slug: 'dung-cu-cam-tay' },
  { name: 'Thiết bị đo', slug: 'thiet-bi-do' },
  { name: 'Máy nén khí', slug: 'may-nen-khi' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-brand text-white">
        <div className="container-x flex h-9 items-center justify-between text-xs">
          <span>Miễn phí vận chuyển đơn hàng từ 5 triệu</span>
          <div className="hidden gap-4 sm:flex">
            <Link href="/tin-tuc" className="hover:underline">Tin tức</Link>
            <Link href="/dai-ly" className="hover:underline">Đăng ký đại lý</Link>
            <Link href="/lien-he" className="hover:underline">Liên hệ</Link>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container-x flex items-center gap-4 py-3">
        <button
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở menu"
        >
          {open ? <X /> : <Menu />}
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-extrabold text-brand">
            Tech<span className="text-accent">Mart</span>
          </span>
        </Link>

        {/* Search */}
        <form
          action="/tim-kiem"
          className="hidden flex-1 items-center rounded-md border-2 border-brand md:flex"
        >
          <input
            name="q"
            placeholder="Tìm máy khoan, máy hàn, Makita..."
            className="w-full rounded-l-md px-4 py-2.5 outline-none"
            aria-label="Tìm kiếm sản phẩm"
          />
          <button className="flex items-center gap-1 bg-brand px-5 py-2.5 text-white">
            <Search size={18} /> Tìm
          </button>
        </form>

        {/* Hotline */}
        <a
          href="tel:19001234"
          className="hidden items-center gap-2 text-brand lg:flex"
        >
          <Phone size={22} />
          <div className="leading-tight">
            <div className="text-xs text-gray-500">Hotline</div>
            <div className="font-bold">1900 1234</div>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <Link
            href="/bao-gia"
            className="hidden items-center gap-1 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white sm:flex"
          >
            <FileText size={16} /> Báo giá nhanh
          </Link>
          <Link href="/tai-khoan" className="flex flex-col items-center text-brand" aria-label="Tài khoản">
            <User size={22} />
            <span className="text-[10px]">Tài khoản</span>
          </Link>
          <Link href="/gio-hang" className="relative flex flex-col items-center text-brand" aria-label="Giỏ hàng">
            <ShoppingCart size={22} />
            <span className="text-[10px]">Giỏ hàng</span>
          </Link>
        </div>
      </div>

      {/* Category nav / mega menu */}
      <nav className="border-t bg-white">
        <div
          className={cn(
            'container-x lg:flex lg:items-center lg:gap-6',
            open ? 'block' : 'hidden lg:flex',
          )}
        >
          {MEGA_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/danh-muc/${c.slug}`}
              className="block py-2.5 text-sm font-medium text-gray-700 hover:text-brand lg:py-3"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
