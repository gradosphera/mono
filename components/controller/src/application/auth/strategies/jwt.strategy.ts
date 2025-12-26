// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import config from '~/config/config';
import { User } from '~/models';
import { tokenTypes } from '~/types/token.types';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(JwtStrategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: any) {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    const user = await User.findOne({ _id: payload.sub });

    if (!user) {
      throw new Error('Пользователь с указанным JWT не найден');
    }

    return user; // `user` будет добавлен в `req.user` в запросе
  }
}
