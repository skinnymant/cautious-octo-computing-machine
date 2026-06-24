import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  findAll(featured?: boolean) {
    return this.prisma.brand.findMany({
      where: featured === undefined ? {} : { featured },
      orderBy: { position: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({ where: { slug } });
    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');
    return brand;
  }

  create(data: any) {
    return this.prisma.brand.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
