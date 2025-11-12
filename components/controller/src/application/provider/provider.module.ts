import { Module } from '@nestjs/common';
import { ProviderService } from './services/provider.service';
import { ProviderResolver } from './resolvers/provider.resolver';
import { ConfigModule } from '@nestjs/config';
// Импортируем для регистрации GraphQL enum
import '~/domain/instance-status.enum';

@Module({
  imports: [ConfigModule],
  providers: [ProviderService, ProviderResolver],
  exports: [ProviderService],
})
export class ProviderModule {}
