import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated } from '../common/pagination';
import { QueryProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const { page = 1, limit = 20 } = query;
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (query.category) where.category = { slug: query.category };
    if (query.brand) where.brand = { slug: query.brand };
    if (query.q)
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { sku: { contains: query.q, mode: 'insensitive' } },
        { shortDesc: { contains: query.q, mode: 'insensitive' } },
      ];
    if (query.minPrice || query.maxPrice)
      where.price = {
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      };
    if (query.inStock === 'true') where.stock = { gt: 0 };
    if (query.tag === 'featured') where.isFeatured = true;
    if (query.tag === 'new') where.isNew = true;
    if (query.tag === 'sale') where.salePrice = { not: null };

    const orderBy = this.resolveSort(query.sort, query.tag);

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          images: { orderBy: { position: 'asc' }, take: 1 },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginated(data, total, page, limit);
  }

  private resolveSort(
    sort?: string,
    tag?: string,
  ): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'name':
        return { name: 'asc' };
      case 'newest':
        return { createdAt: 'desc' };
      default:
        return tag === 'bestseller'
          ? { soldCount: 'desc' }
          : { createdAt: 'desc' };
    }
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        questions: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { fullName: true } } },
          take: 20,
        },
      },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  related(productId: string, categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId, id: { not: productId }, isActive: true },
      take: 8,
      orderBy: { soldCount: 'desc' },
      include: { images: { take: 1 }, brand: { select: { name: true } } },
    });
  }

  async compare(slugs: string[]) {
    return this.prisma.product.findMany({
      where: { slug: { in: slugs } },
      include: { brand: true, images: { take: 1 } },
    });
  }

  create(data: any) {
    return this.prisma.product.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
