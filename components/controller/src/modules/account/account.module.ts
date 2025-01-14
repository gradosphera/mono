import { Module } from '@nestjs/common';
import { AccountResolver } from './resolvers/account.resolver';
import { AccountService } from './services/account.service';
import { AccountDomainInteractor } from '~/domain/account/interactors/account.interactor';
import { AccountDomainModule } from '~/domain/account/account-domain.module';

@Module({
  imports: [AccountDomainModule],
  controllers: [],
  providers: [AccountDomainInteractor, AccountService, AccountResolver],
  exports: [],
})
export class AccountModule {}
