import { Module, forwardRef } from '@nestjs/common';
import { AccountAdapter } from './account.adapter';
import { ACCOUNT_DOMAIN_PORT } from '~/domain/account/ports/account-domain.port';
import { AccountModule } from '~/application/account/account.module';

@Module({
  imports: [forwardRef(() => AccountModule)],
  providers: [
    AccountAdapter,
    {
      provide: ACCOUNT_DOMAIN_PORT,
      useClass: AccountAdapter,
    },
  ],
  exports: [AccountAdapter, ACCOUNT_DOMAIN_PORT],
})
export class AccountInfrastructureModule {}
