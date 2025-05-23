import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { DocumentResolver } from './resolvers/document.resolver';
import { DocumentService } from './services/document.service';
import { UserCertificateService } from './services/user-certificate.service';

@Module({
  imports: [DomainModule],
  providers: [DocumentResolver, DocumentService, UserCertificateService],
  exports: [UserCertificateService],
})
export class DocumentModule {}
