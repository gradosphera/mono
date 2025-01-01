// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthStrategy } from './strategies/jwt.strategy';
import { DomainModule } from '~/domain/domain.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { AuthService } from './services/auth.service';

@Module({
  imports: [PassportModule, DomainModule],
  providers: [JwtAuthStrategy, AuthResolver, AuthService],
  exports: [PassportModule],
})
export class AuthModule {}
