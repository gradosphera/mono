import { Global, Module, forwardRef } from '@nestjs/common';
import { AgreementConfigurationService, AGREEMENT_CONFIGURATION_SERVICE } from './services/agreement-configuration.service';
import { RegistrationDocumentsService, REGISTRATION_DOCUMENTS_SERVICE } from './services/registration-documents.service';
import { CooperativeConfigService } from './services/cooperative-config.service';
import { DocumentModule } from '~/application/document/document.module';
import { ExtensionDomainModule } from '~/domain/extension/extension-domain.module';

/**
 * Глобальный модуль для сервисов регистрации
 * Сделан глобальным чтобы быть доступным в BlockchainModule (который тоже глобальный)
 *
 * ВАЖНО: Импортирует ExtensionDomainModule для обеспечения доступности реализаций портов из расширений.
 * Расширения регистрируются через ExtensionsModule и предоставляют свои реализации портов.
 */
@Global()
@Module({
  imports: [forwardRef(() => DocumentModule), ExtensionDomainModule],
  providers: [
    CooperativeConfigService,
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
