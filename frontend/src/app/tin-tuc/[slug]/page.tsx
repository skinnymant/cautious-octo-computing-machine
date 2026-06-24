import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { Article } from '@/lib/types';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const a = await api.article(slug);
    return {
      title: a.title,
      description: a.excerpt ?? a.title,
      alternates: { canonical: `/tin-tuc/${slug}` },
      openGraph: { title: a.title, images: a.coverUrl ? [a.coverUrl] : [] },
    };
  } catch {
    return { title: 'Bài viết' };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let article: Article;
  try {
    article = await api.article(slug);
  } catch {
    notFound();
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article!.title,
    image: article!.coverUrl,
    datePublished: article!.publishedAt,
    author: { '@type': 'Person', name: article!.author?.fullName ?? 'TechMart' },
  };

  return (
    <article className="container-x max-w-3xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1 className="text-3xl font-bold">{article!.title}</h1>
      <div className="mt-2 text-sm text-gray-500">
        {article!.author?.fullName ?? 'TechMart'} ·{' '}
        {new Date(article!.publishedAt).toLocaleDateString('vi-VN')}
      </div>
      {article!.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article!.coverUrl} alt={article!.title} className="mt-4 w-full rounded-lg" width={768} height={432} />
      )}
      <div
        className="prose mt-6 max-w-none"
        dangerouslySetInnerHTML={{ __html: article!.content ?? '' }}
      />
    </article>
  );
}
