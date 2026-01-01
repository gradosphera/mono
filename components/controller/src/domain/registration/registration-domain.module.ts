import { Global, Module, forwardRef } from '@nestjs/common';
import { AgreementConfigurationService, AGREEMENT_CONFIGURATION_SERVICE } from './services/agreement-configuration.service';
import { RegistrationDocumentsService, REGISTRATION_DOCUMENTS_SERVICE } from './services/registration-documents.service';
import { DocumentModule } from '~/application/document/document.module';

/**
 * Глобальный модуль для сервисов регистрации
 * Сделан глобальным чтобы быть доступным в BlockchainModule (который тоже глобальный)
 * Импортирует DocumentInteractorModule для доступа к DocumentInteractor
 */
@Global()
@Module({
  imports: [forwardRef(() => DocumentModule)],
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
