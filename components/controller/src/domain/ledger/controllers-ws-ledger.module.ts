import { Global, Module } from '@nestjs/common';
import { LedgerDomainInteractor } from './interactors/ledger.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { setLedgerInteractor } from '~/controllers/ws.controller';

/**
 * Модуль для интеграции ledger интерактора с ws контроллером
 * Устанавливает ledgerInteractor в ws.controller для обработки событий
 */
@Global()
@Module({
  imports: [InfrastructureModule],
  providers: [
    {
      provide: 'LEDGER_WS_SETUP',
      useFactory: (ledgerInteractor: LedgerDomainInteractor) => {
        // Устанавливаем интерактор в ws.controller
        setLedgerInteractor(ledgerInteractor);
        return true;
      },
      inject: [LedgerDomainInteractor],
    },
  ],
})
export class ControllersWsLedgerModule {}
