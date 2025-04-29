// domain/account/account-domain.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { AccountDomainInteractor } from './interactors/account.interactor';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { DocumentDomainModule } from '../document/document.module';

@Module({
  imports: [forwardRef(() => DocumentDomainModule)],
  providers: [AccountDomainService, AccountDomainInteractor],
  exports: [AccountDomainInteractor, AccountDomainService],
})
export class AccountDomainModule {}
