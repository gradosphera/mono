import { Global, Module, forwardRef } from '@nestjs/common';
import { AgreementConfigurationService, AGREEMENT_CONFIGURATION_SERVICE } from './services/agreement-configuration.service';
import { RegistrationDocumentsService, REGISTRATION_DOCUMENTS_SERVICE } from './services/registration-documents.service';
import { DocumentDomainModule } from '~/domain/document/document.module';

/**
 * Глобальный модуль для сервисов регистрации
 * Сделан глобальным чтобы быть доступным в BlockchainModule (который тоже глобальный)
 * Импортирует DocumentDomainModule через forwardRef для доступа к DocumentDomainInteractor
 */
@Global()
@Module({
  imports: [forwardRef(() => DocumentDomainModule)],
  providers: [
    AgreementConfigurationService,
    {
      provide: AGREEMENT_CONFIGURATION_SERVICE,
      useExisting: AgreementConfigurationService,
    },
    RegistrationDocumentsService,
    {
      provide: REGISTRATION_DOCUMENTS_SERVICE,
      useExisting: RegistrationDocumentsService,
    },
  ],
  exports: [
    AgreementConfigurationService,
    AGREEMENT_CONFIGURATION_SERVICE,
    RegistrationDocumentsService,
    REGISTRATION_DOCUMENTS_SERVICE,
  ],
})
export class RegistrationDomainModule {}
