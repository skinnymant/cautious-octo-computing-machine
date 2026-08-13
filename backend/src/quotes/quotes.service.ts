import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string | undefined, dto: CreateQuoteDto) {
    const quote = await this.prisma.quoteRequest.create({
      data: {
        code: 'QT' + Date.now().toString(36).toUpperCase(),
        userId,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        company: dto.company,
        note: dto.note,
        fileUrl: dto.fileUrl,
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            note: i.note,
          })),
        },
      },
      include: { items: true },
    });

    // Fire-and-forget notification; never block the request on SMTP.
    this.sendNotification(quote).catch((err) =>
      this.logger.warn(`Gửi email báo giá thất bại: ${err.message}`),
    );

    return quote;
  }

  private async sendNotification(quote: any) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'mailhog',
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    const itemsHtml = quote.items
      .map((i: any) => `<li>${i.name} — SL: ${i.quantity}</li>`)
      .join('');

    // To sales team
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: 'sales@techmart.vn',
      subject: `[Báo giá] ${quote.code} — ${quote.contactName}`,
      html: `<h3>Yêu cầu báo giá ${quote.code}</h3>
        <p>Khách: ${quote.contactName} — ${quote.contactPhone} — ${quote.contactEmail}</p>
        <p>Công ty: ${quote.company ?? '-'}</p>
        <ul>${itemsHtml}</ul>
        <p>Ghi chú: ${quote.note ?? '-'}</p>`,
    });

    // Confirmation to customer
    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: quote.contactEmail,
      subject: `TechMart đã nhận yêu cầu báo giá ${quote.code}`,
      html: `<p>Cảm ơn ${quote.contactName}, chúng tôi đã nhận yêu cầu báo giá <b>${quote.code}</b> và sẽ phản hồi trong 24h.</p>`,
    });
  }

  findUserQuotes(userId: string) {
    return this.prisma.quoteRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  findAll() {
    return this.prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  updateStatus(id: string, status: any) {
    return this.prisma.quoteRequest.update({ where: { id }, data: { status } });
  }
}
