import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * AI features. When ANTHROPIC_API_KEY is set, calls the Claude API to power
 * natural-language search, recommendations, chat support and the quote
 * assistant. Otherwise falls back to deterministic heuristics so the demo
 * works offline.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.ANTHROPIC_API_KEY;
  private readonly model = process.env.AI_MODEL ?? 'claude-fable-5';

  constructor(private prisma: PrismaService) {}

  private async callClaude(system: string, user: string): Promise<string | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
      const data: any = await res.json();
      return data?.content?.[0]?.text ?? null;
    } catch (err: any) {
      this.logger.warn(`Claude API lỗi: ${err.message}`);
      return null;
    }
  }

  /** Natural-language search: "máy khoan pin makita dưới 2 triệu". */
  async smartSearch(query: string) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortDesc: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 12,
      include: { images: { take: 1 }, brand: true },
    });

    const ai = await this.callClaude(
      'Bạn là trợ lý tìm kiếm sản phẩm công nghiệp. Tóm tắt ý định người dùng trong 1 câu tiếng Việt.',
      query,
    );

    return { intent: ai, results: products };
  }

  /** Recommend products related to a given product (content-based). */
  async recommend(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return [];
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId ?? undefined },
        ],
      },
      orderBy: { soldCount: 'desc' },
      take: 8,
      include: { images: { take: 1 }, brand: true },
    });
  }

  /** Conversational support grounded in the catalog. */
  async chat(message: string) {
    const reply = await this.callClaude(
      'Bạn là nhân viên tư vấn của TechMart — cửa hàng thiết bị & dụng cụ công nghiệp. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.',
      message,
    );
    return {
      reply:
        reply ??
        'Cảm ơn bạn đã liên hệ TechMart. Nhân viên tư vấn sẽ phản hồi sớm. Bạn có thể gọi hotline 1900 1234 để được hỗ trợ ngay.',
    };
  }

  /** Suggests likely products for a free-text quote line. */
  async quoteAssist(text: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: text, mode: 'insensitive' },
      },
      take: 5,
      include: { images: { take: 1 } },
    });
  }
}
