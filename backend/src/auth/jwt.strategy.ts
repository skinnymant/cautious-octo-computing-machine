import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from '../common/decorators';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: JwtUser['role'];
  }): Promise<JwtUser> {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
