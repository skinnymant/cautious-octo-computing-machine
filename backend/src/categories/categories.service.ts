import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /** Full multi-level tree (root categories with nested children). */
  async tree() {
    const all = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
    const byParent = new Map<string | null, any[]>();
    for (const c of all) {
      const key = c.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push({ ...c, children: [] });
    }
    const attach = (node: any) => {
      node.children = byParent.get(node.id) ?? [];
      node.children.forEach(attach);
      return node;
    };
    return (byParent.get(null) ?? []).map(attach);
  }

  findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true, parent: true },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  create(data: any) {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
