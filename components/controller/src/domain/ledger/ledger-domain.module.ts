import { Global, Module } from '@nestjs/common';
import { LedgerDomainInteractor } from './interactors/ledger.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';

/**
 * Доменный модуль для ledger
 * Содержит бизнес-логику работы с планом счетов и состоянием ledger
 */
@Global()
@Module({
  imports: [InfrastructureModule],
  providers: [LedgerDomainInteractor],
  exports: [LedgerDomainInteractor],
})
export class LedgerDomainModule {}
