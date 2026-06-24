import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private async signTokens(user: {
    id: string;
    email: string;
    role: any;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
    });

    const tokenHash = await argon2.hash(refreshToken);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email đã được sử dụng');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        companyName: dto.companyName,
        taxCode: dto.taxCode,
        role: dto.companyName ? 'DEALER' : 'CUSTOMER',
        cart: { create: {} },
      },
    });

    const tokens = await this.signTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const tokens = await this.signTokens(user);
    return { user: this.sanitize(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revoked: false },
    });
    let matched = false;
    for (const t of tokens) {
      if (await argon2.verify(t.tokenHash, refreshToken)) {
        matched = true;
        await this.prisma.refreshToken.update({
          where: { id: t.id },
          data: { revoked: true },
        });
        break;
      }
    }
    if (!matched) throw new UnauthorizedException('Refresh token đã bị thu hồi');

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
    });
    return this.signTokens(user);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return { success: true };
  }

  private sanitize(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
