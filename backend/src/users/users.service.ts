import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async profile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { addresses: true },
    });
    const { passwordHash, ...rest } = user;
    return rest;
  }

  updateProfile(userId: string, data: any) {
    const { email, role, passwordHash, ...safe } = data;
    return this.prisma.user.update({ where: { id: userId }, data: safe });
  }

  addAddress(userId: string, data: any) {
    return this.prisma.address.create({ data: { ...data, userId } });
  }

  // ─── Wishlist ──────────────────────────────────────────
  wishlist(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { images: { take: 1 } } } },
    });
  }

  async toggleWishlist(userId: string, productId: string) {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { wishlisted: false };
    }
    await this.prisma.wishlistItem.create({ data: { userId, productId } });
    return { wishlisted: true };
  }

  // ─── Admin ─────────────────────────────────────────────
  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        companyName: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
