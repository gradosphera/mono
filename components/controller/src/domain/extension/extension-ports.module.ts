import { forwardRef, Module } from '@nestjs/common';
import { AccountExtensionAdapter } from './adapters/account-extension.adapter';
import { MeetExtensionAdapter } from './adapters/meet-extension.adapter';
import { DocumentExtensionAdapter } from './adapters/document-extension.adapter';
import { VarsExtensionAdapter } from './adapters/vars-extension.adapter';
import { ACCOUNT_EXTENSION_PORT } from './ports/account-extension-port';
import { MEET_EXTENSION_PORT } from './ports/meet-extension-port';
import { DOCUMENT_EXTENSION_PORT } from './ports/document-extension-port';
import { VARS_EXTENSION_PORT } from './ports/vars-extension-port';
import { MeetDomainModule } from '~/domain/meet/meet-domain.module';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { DocumentModule } from '~/application/document/document.module';
import { AccountModule } from '~/application/account/account.module';

/**
 * Модуль для предоставления портов расширениям
 * Этот модуль не имеет зависимостей от других модулей для избежания циклических зависимостей
 */
@Module({
  imports: [
    forwardRef(() => AccountModule),
    forwardRef(() => MeetDomainModule),
    forwardRef(() => DocumentDomainModule),
    forwardRef(() => DocumentModule),
  ],
  providers: [
    AccountExtensionAdapter,
    MeetExtensionAdapter,
    DocumentExtensionAdapter,
    VarsExtensionAdapter,
    {
      provide: ACCOUNT_EXTENSION_PORT,
      useExisting: AccountExtensionAdapter,
    },
    {
      provide: MEET_EXTENSION_PORT,
      useExisting: MeetExtensionAdapter,
    },
    {
      provide: DOCUMENT_EXTENSION_PORT,
      useExisting: DocumentExtensionAdapter,
    },
    {
      provide: VARS_EXTENSION_PORT,
      useExisting: VarsExtensionAdapter,
    },
  ],
  exports: [ACCOUNT_EXTENSION_PORT, MEET_EXTENSION_PORT, DOCUMENT_EXTENSION_PORT, VARS_EXTENSION_PORT],
})
export class ExtensionPortsModule {}
