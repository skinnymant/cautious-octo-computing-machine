import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, PaginationDto } from '../common/pagination';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto & { category?: string; tag?: string }) {
    const { page = 1, limit = 12 } = query;
    const where: any = { isPublished: true };
    if (query.category) where.category = { slug: query.category };
    if (query.tag) where.tags = { some: { slug: query.tag } };

    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          author: { select: { fullName: true } },
          tags: true,
        },
      }),
      this.prisma.article.count({ where }),
    ]);
    return paginated(data, total, page, limit);
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { fullName: true, avatarUrl: true } },
        tags: true,
      },
    });
    if (!article) throw new NotFoundException('Không tìm thấy bài viết');
    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
    return article;
  }

  categories() {
    return this.prisma.articleCategory.findMany();
  }

  create(data: any) {
    return this.prisma.article.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.article.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.article.delete({ where: { id } });
  }
}
