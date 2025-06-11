import { forwardRef, Module } from '@nestjs/common';
import { AccountExtensionAdapter } from './adapters/account-extension.adapter';
import { MeetExtensionAdapter } from './adapters/meet-extension.adapter';
import { ACCOUNT_EXTENSION_PORT } from './ports/account-extension-port';
import { MEET_EXTENSION_PORT } from './ports/meet-extension-port';
import { MeetDomainModule } from '~/domain/meet/meet-domain.module';

/**
 * Модуль для предоставления портов расширениям
 * Этот модуль не имеет зависимостей от других модулей для избежания циклических зависимостей
 * AccountDomainModule импортировать не нужно, так как он глобальный
 */
@Module({
  imports: [forwardRef(() => MeetDomainModule)],
  providers: [
    AccountExtensionAdapter,
    MeetExtensionAdapter,
    {
      provide: ACCOUNT_EXTENSION_PORT,
      useExisting: AccountExtensionAdapter,
    },
    {
      provide: MEET_EXTENSION_PORT,
      useExisting: MeetExtensionAdapter,
    },
  ],
  exports: [ACCOUNT_EXTENSION_PORT, MEET_EXTENSION_PORT],
})
export class ExtensionPortsModule {}
