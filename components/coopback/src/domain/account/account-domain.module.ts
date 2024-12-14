// domain/account/account-domain.module.ts

import { Module } from '@nestjs/common';
import { AccountDomainInteractor } from './interactors/account.interactor';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';

@Module({
  imports: [],
  providers: [AccountDomainService, AccountDomainInteractor],
  exports: [AccountDomainInteractor, AccountDomainService],
})
export class AccountDomainModule {}
