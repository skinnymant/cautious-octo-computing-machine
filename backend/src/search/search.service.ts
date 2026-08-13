import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';

const INDEX = 'products';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private es: Client;
  private esReady = false;

  constructor(private prisma: PrismaService) {
    this.es = new Client({
      node: process.env.ELASTICSEARCH_NODE ?? 'http://elasticsearch:9200',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.es.indices.exists({ index: INDEX });
      if (!exists) {
        await this.es.indices.create({
          index: INDEX,
          mappings: {
            properties: {
              name: { type: 'text' },
              shortDesc: { type: 'text' },
              brand: { type: 'keyword' },
              category: { type: 'keyword' },
              price: { type: 'double' },
              slug: { type: 'keyword' },
              imageUrl: { type: 'keyword' },
            },
          },
        });
      }
      this.esReady = true;
    } catch (err: any) {
      this.logger.warn(
        `Elasticsearch chưa sẵn sàng, dùng Postgres fallback: ${err.message}`,
      );
    }
  }

  /** Index/update a single product document. */
  async indexProduct(product: any) {
    if (!this.esReady) return;
    await this.es.index({
      index: INDEX,
      id: product.id,
      document: {
        name: product.name,
        shortDesc: product.shortDesc,
        brand: product.brand?.name,
        category: product.category?.name,
        price: Number(product.salePrice ?? product.price),
        slug: product.slug,
        imageUrl: product.images?.[0]?.url,
      },
    });
  }

  /** Reindex everything (called by seed / admin). */
  async reindexAll() {
    if (!this.esReady) return { indexed: 0 };
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { brand: true, category: true, images: { take: 1 } },
    });
    const operations = products.flatMap((p) => [
      { index: { _index: INDEX, _id: p.id } },
      {
        name: p.name,
        shortDesc: p.shortDesc,
        brand: p.brand?.name,
        category: p.category?.name,
        price: Number(p.salePrice ?? p.price),
        slug: p.slug,
        imageUrl: p.images[0]?.url,
      },
    ]);
    if (operations.length) await this.es.bulk({ refresh: true, operations });
    return { indexed: products.length };
  }

  async search(q: string, limit = 20) {
    if (this.esReady && q) {
      try {
        const res = await this.es.search({
          index: INDEX,
          size: limit,
          query: {
            multi_match: {
              query: q,
              fields: ['name^3', 'shortDesc', 'brand', 'category'],
              fuzziness: 'AUTO',
            },
          },
        });
        return res.hits.hits.map((h: any) => ({ id: h._id, ...h._source }));
      } catch (err: any) {
        this.logger.warn(`ES query lỗi, fallback Postgres: ${err.message}`);
      }
    }
    // Postgres fallback
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { shortDesc: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: { images: { take: 1 }, brand: { select: { name: true } } },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.salePrice ?? p.price),
      brand: p.brand?.name,
      imageUrl: p.images[0]?.url,
    }));
  }

  async suggest(q: string) {
    const results = await this.search(q, 6);
    return results.map((r: any) => ({ name: r.name, slug: r.slug }));
  }
}
