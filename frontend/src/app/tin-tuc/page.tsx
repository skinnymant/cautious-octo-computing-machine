import { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Article } from '@/lib/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Tin tức kỹ thuật',
  description: 'Kiến thức, hướng dẫn sử dụng và mẹo bảo trì thiết bị công nghiệp từ chuyên gia TechMart.',
  alternates: { canonical: '/tin-tuc' },
};

export default async function NewsPage() {
  let articles: Article[] = [];
  try {
    articles = (await api.articles({ limit: 20 })).data;
  } catch {
    /* ignore */
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold">Tin tức kỹ thuật</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.id} href={`/tin-tuc/${a.slug}`} className="overflow-hidden rounded-lg border bg-white transition hover:shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.coverUrl} alt={a.title} className="h-44 w-full object-cover" width={400} height={225} />
            <div className="p-4">
              {a.category && <span className="text-xs font-medium text-accent">{a.category.name}</span>}
              <h2 className="mt-1 line-clamp-2 font-semibold text-gray-800">{a.title}</h2>
              <p className="mt-1 line-clamp-3 text-sm text-gray-500">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
