// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule],
  providers: [JwtAuthStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
