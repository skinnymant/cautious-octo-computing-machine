export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDesc?: string;
  description?: string;
  price: string | number;
  salePrice?: string | number | null;
  stock: number;
  unit: string;
  isFeatured?: boolean;
  isNew?: boolean;
  soldCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  specs?: { key: string; value: string }[];
  images?: ProductImage[];
  brand?: Brand;
  category?: Category;
  related?: Product[];
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  publishedAt: string;
  category?: { name: string; slug: string };
  author?: { fullName: string };
}
