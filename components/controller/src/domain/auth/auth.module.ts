// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { AuthDomainInteractor } from './interactors/auth.interactor';
import { AuthDomainService } from './services/auth-domain.service';
import { AccountDomainModule } from '../account/account-domain.module';
import { NotificationModule } from '~/application/notification/notification.module';

@Module({
  imports: [AccountDomainModule, NotificationModule],
  providers: [AuthDomainInteractor, AuthDomainService],
  exports: [AuthDomainInteractor, AuthDomainService],
})
export class AuthDomainModule {}
