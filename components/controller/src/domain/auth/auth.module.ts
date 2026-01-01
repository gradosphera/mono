// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { AuthDomainService } from './services/auth-domain.service';
import { AccountDomainModule } from '../account/account-domain.module';
import { UserDomainModule } from '../user/user-domain.module';
import { NotificationModule } from '~/application/notification/notification.module';
import { TokenApplicationModule } from '~/application/token/token-application.module';

@Module({
  imports: [AccountDomainModule, UserDomainModule, NotificationModule, TokenApplicationModule],
  providers: [AuthDomainService],
  exports: [AuthDomainService],
})
export class AuthDomainModule {}
