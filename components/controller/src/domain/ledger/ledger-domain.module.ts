import { Global, Module } from '@nestjs/common';
import { LedgerDomainInteractor } from './interactors/ledger.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { ControllersWsLedgerModule } from './controllers-ws-ledger.module';

/**
 * Доменный модуль для ledger
 * Содержит бизнес-логику работы с планом счетов и состоянием ledger
 */
@Global()
@Module({
  imports: [InfrastructureModule, ControllersWsLedgerModule],
  providers: [LedgerDomainInteractor],
  exports: [LedgerDomainInteractor],
})
export class LedgerDomainModule {}
