import type { Article, Brand, Category, Paginated, Product } from './types';

// On the server (inside Docker) talk to the backend service directly; in the
// browser go through the Nginx-proxied public URL.
const SERVER_API =
  process.env.INTERNAL_API_URL ?? 'http://backend:4000';
const PUBLIC_API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api';

const baseUrl = typeof window === 'undefined' ? SERVER_API : PUBLIC_API;

async function get<T>(
  path: string,
  opts: { revalidate?: number } = {},
): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    next: { revalidate: opts.revalidate ?? 60 },
    headers: { 'content-type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  categoriesTree: () =>
    get<Category[]>('/categories/tree', { revalidate: 300 }),
  brands: (featured?: boolean) =>
    get<Brand[]>(`/brands${featured ? '?featured=true' : ''}`, {
      revalidate: 300,
    }),
  products: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    return get<Paginated<Product>>(`/products?${qs}`);
  },
  product: (slug: string) => get<Product>(`/products/${slug}`),
  articles: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    return get<Paginated<Article>>(`/articles?${qs}`);
  },
  article: (slug: string) => get<Article>(`/articles/${slug}`),
};
