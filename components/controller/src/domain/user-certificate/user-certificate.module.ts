import { Module } from '@nestjs/common';
import { UserCertificateDomainService } from './services/user-certificate-domain.service';

@Module({
  providers: [UserCertificateDomainService],
  exports: [UserCertificateDomainService],
})
export class UserCertificateDomainModule {}
