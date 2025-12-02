import { forwardRef, Module } from '@nestjs/common';
import { AccountExtensionAdapter } from './adapters/account-extension.adapter';
import { MeetExtensionAdapter } from './adapters/meet-extension.adapter';
import { DocumentExtensionAdapter } from './adapters/document-extension.adapter';
import { ACCOUNT_EXTENSION_PORT } from './ports/account-extension-port';
import { MEET_EXTENSION_PORT } from './ports/meet-extension-port';
import { DOCUMENT_EXTENSION_PORT } from './ports/document-extension-port';
import { MeetDomainModule } from '~/domain/meet/meet-domain.module';
import { DocumentDomainModule } from '~/domain/document/document.module';

/**
 * Модуль для предоставления портов расширениям
 * Этот модуль не имеет зависимостей от других модулей для избежания циклических зависимостей
 * AccountDomainModule импортировать не нужно, так как он глобальный
 */
@Module({
  imports: [forwardRef(() => MeetDomainModule), forwardRef(() => DocumentDomainModule)],
  providers: [
    AccountExtensionAdapter,
    MeetExtensionAdapter,
    DocumentExtensionAdapter,
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
  ],
  exports: [ACCOUNT_EXTENSION_PORT, MEET_EXTENSION_PORT, DOCUMENT_EXTENSION_PORT],
})
export class ExtensionPortsModule {}
