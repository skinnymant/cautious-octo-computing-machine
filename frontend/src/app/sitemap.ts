import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import type { Article, Product } from '@/lib/types';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/bao-gia', '/tin-tuc', '/thuong-hieu', '/dai-ly'].map(
    (p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: p === '' ? 1 : 0.7,
    }),
  );

  let products: Product[] = [];
  let articles: Article[] = [];
  try {
    products = (await api.products({ limit: 100 })).data;
    articles = (await api.articles({ limit: 50 })).data;
  } catch {
    /* backend not ready at build time */
  }

  const productRoutes = products.map((p) => ({
    url: `${base}/san-pham/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${base}/tin-tuc/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes];
}
