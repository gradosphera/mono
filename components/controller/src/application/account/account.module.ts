import { Module } from '@nestjs/common';
import { AccountResolver } from './resolvers/account.resolver';
import { AccountService } from './services/account.service';
import { AccountDomainModule } from '~/domain/account/account-domain.module';

@Module({
  imports: [AccountDomainModule],
  controllers: [],
  providers: [AccountService, AccountResolver],
  exports: [],
})
export class AccountModule {}
