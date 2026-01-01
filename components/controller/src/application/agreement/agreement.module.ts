import { Module } from '@nestjs/common';
import { AgreementResolver } from './resolvers/agreement.resolver';
import { AgreementService } from './services/agreement.service';
import { AgreementInteractor } from './use-cases/agreement.interactor';
import { DocumentModule } from '~/application/document/document.module';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [DocumentModule, DocumentDomainModule],
  controllers: [],
  providers: [AgreementResolver, AgreementService, AgreementInteractor],
  exports: [],
})
export class AgreementModule {}
