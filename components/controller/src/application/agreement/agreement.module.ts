import { Global, Module } from '@nestjs/common';
import { AgreementResolver } from './resolvers/agreement.resolver';
import { AgreementService } from './services/agreement.service';
import { AgreementInteractor } from './use-cases/agreement.interactor';
import { DocumentModule } from '~/application/document/document.module';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { AGREEMENT_SIGNATURE_PORT } from '~/domain/agreement/ports/agreement-signature.port';

/**
 * Модуль соглашений.
 *
 * `AgreementService` объединяет два источника (Эпик 2): непрограммные
 * соглашения из `agreements3` и программные из `wallet::users.programs[]`.
 * Оба репозитория экспортируются глобальным `TypeOrmModule`.
 *
 * @Global — чтобы расширения (capital, Стол заказов) могли инжектить
 * `AGREEMENT_SIGNATURE_PORT` без явного импорта AgreementModule
 * в свой extension-module.
 */
@Global()
@Module({
  imports: [DocumentModule, DocumentDomainModule],
  controllers: [],
  providers: [
    AgreementResolver,
    AgreementService,
    AgreementInteractor,
    {
      provide: AGREEMENT_SIGNATURE_PORT,
      useExisting: AgreementService,
    },
  ],
  exports: [AGREEMENT_SIGNATURE_PORT],
})
export class AgreementModule {}
