import { Global, Module } from '@nestjs/common';

/**
 * Доменный модуль для ledger
 * Содержит доменные сущности, интерфейсы, порты и репозитории
 */
@Global()
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class LedgerDomainModule {}
