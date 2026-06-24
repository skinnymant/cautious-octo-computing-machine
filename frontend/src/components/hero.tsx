'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-brand to-brand-dark text-white">
      <div className="container-x grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent-light">
            Phân phối chính hãng · Bảo hành toàn quốc
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Thiết bị & dụng cụ công nghiệp <span className="text-accent">chính hãng</span>
          </h1>
          <p className="mt-4 max-w-lg text-blue-100">
            Hơn 500 sản phẩm từ 50+ thương hiệu hàng đầu: Makita, Bosch, Dewalt,
            Milwaukee… Giá tốt cho cả khách lẻ và đại lý.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/danh-muc/may-khoan" className="btn-accent">
              Mua ngay <ArrowRight size={18} />
            </Link>
            <Link
              href="/bao-gia"
              className="inline-flex items-center gap-2 rounded-md border-2 border-white px-5 py-2.5 font-semibold text-white transition hover:bg-white hover:text-brand"
            >
              <FileText size={18} /> Yêu cầu báo giá
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://placehold.co/640x420/00468a/ffffff?text=TechMart"
            alt="Thiết bị công nghiệp TechMart"
            className="w-full rounded-xl shadow-2xl"
            width={640}
            height={420}
          />
        </motion.div>
      </div>
    </section>
  );
}
