import { Module } from '@nestjs/common';
import { UserAdapter } from './user.adapter';
import { USER_CERTIFICATE_DOMAIN_PORT } from '~/domain/user/ports/user-certificate-domain.port';
import { UserDomainModule } from '~/domain/user/user-domain.module';
import { AccountDomainModule } from '~/domain/account/account-domain.module';

@Module({
  imports: [UserDomainModule, AccountDomainModule],
  providers: [
    UserAdapter,
    {
      provide: USER_CERTIFICATE_DOMAIN_PORT,
      useExisting: UserAdapter,
    },
  ],
  exports: [UserAdapter, USER_CERTIFICATE_DOMAIN_PORT],
})
export class UserInfrastructureModule {}
