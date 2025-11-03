// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { AuthDomainInteractor } from './interactors/auth.interactor';
import { AccountDomainModule } from '../account/account-domain.module';
import { NotificationModule } from '~/application/notification/notification.module';

@Module({
  imports: [AccountDomainModule, NotificationModule],
  providers: [AuthDomainInteractor],
  exports: [AuthDomainInteractor],
})
export class AuthDomainModule {}
