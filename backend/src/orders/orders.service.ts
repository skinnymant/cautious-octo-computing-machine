import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Coupon, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private genCode() {
    return 'TM' + Date.now().toString(36).toUpperCase();
  }

  private computeDiscount(coupon: Coupon | null, subtotal: number): number {
    if (!coupon) return 0;
    if (subtotal < Number(coupon.minOrder)) return 0;
    let discount =
      coupon.type === 'PERCENT'
        ? (subtotal * Number(coupon.value)) / 100
        : Number(coupon.value);
    if (coupon.maxDiscount)
      discount = Math.min(discount, Number(coupon.maxDiscount));
    return Math.min(discount, subtotal);
  }

  async checkout(userId: string, dto: CheckoutDto) {
    if (!dto.items?.length)
      throw new BadRequestException('Giỏ hàng trống');

    const products = await this.prisma.product.findMany({
      where: { id: { in: dto.items.map((i) => i.productId) }, isActive: true },
    });
    const map = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];
    for (const item of dto.items) {
      const product = map.get(item.productId);
      if (!product)
        throw new BadRequestException(`Sản phẩm ${item.productId} không khả dụng`);
      if (product.stock < item.quantity)
        throw new BadRequestException(`Sản phẩm "${product.name}" không đủ hàng`);
      const price = Number(product.salePrice ?? product.price);
      subtotal += price * item.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
      });
    }

    let coupon: Coupon | null = null;
    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });
      if (!coupon || !coupon.isActive)
        throw new BadRequestException('Mã giảm giá không hợp lệ');
    }
    const discount = this.computeDiscount(coupon, subtotal);
    const shippingFee = subtotal >= 5_000_000 ? 0 : 30_000;
    const total = subtotal - discount + shippingFee;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          code: this.genCode(),
          userId,
          status: 'PENDING',
          paymentMethod: dto.paymentMethod,
          subtotal,
          discount,
          shippingFee,
          total,
          couponId: coupon?.id,
          receiverName: dto.receiverName,
          receiverPhone: dto.receiverPhone,
          shippingAddr: dto.shippingAddr,
          note: dto.note,
          items: { createMany: { data: orderItems } },
          payment: {
            create: {
              method: dto.paymentMethod,
              status: 'PENDING',
              amount: total,
            },
          },
        },
        include: { items: true, payment: true },
      });

      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }
      if (coupon)
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });

      // COD / bank transfer => confirmed immediately. Online => stay PENDING
      // until the payment gateway IPN callback updates it.
      if (dto.paymentMethod === 'COD' || dto.paymentMethod === 'BANK_TRANSFER') {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED' },
        });
      }

      return order;
    });
  }

  findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payment: true },
    });
  }

  async findOne(userId: string, code: string) {
    const order = await this.prisma.order.findFirst({
      where: { code, userId },
      include: { items: true, payment: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  // ─── Admin ─────────────────────────────────────────────
  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: { select: { fullName: true, email: true } } },
    });
  }

  updateStatus(id: string, status: any) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}
