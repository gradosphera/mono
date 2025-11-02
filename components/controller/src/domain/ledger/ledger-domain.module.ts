import { Global, Module } from '@nestjs/common';
import { LedgerDomainInteractor } from './interactors/ledger.interactor';
import { LedgerEventService } from './services/ledger-event.service';

/**
 * Доменный модуль для ledger
 * Содержит бизнес-логику работы с планом счетов и состоянием ledger
 */
@Global()
@Module({
  imports: [],
  providers: [LedgerDomainInteractor, LedgerEventService],
  exports: [LedgerDomainInteractor],
})
export class LedgerDomainModule {}
