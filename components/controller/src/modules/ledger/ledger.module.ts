import { Module } from '@nestjs/common';
import { LedgerResolver } from './resolvers/ledger.resolver';
import { LedgerService } from './services/ledger.service';
import { DomainModule } from '~/domain/domain.module';

/**
 * Модуль приложения для ledger
 * Содержит GraphQL резолверы, сервисы и DTO для работы с планом счетов
 */
@Module({
  imports: [DomainModule],
  providers: [LedgerResolver, LedgerService],
})
export class LedgerModule {}
