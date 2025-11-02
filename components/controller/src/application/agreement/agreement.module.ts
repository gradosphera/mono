import { Module } from '@nestjs/common';
import { AgreementResolver } from './resolvers/agreement.resolver';
import { AgreementService } from './services/agreement.service';
import { AgreementInteractor } from './use-cases/agreement.interactor';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [DocumentDomainModule],
  controllers: [],
  providers: [AgreementResolver, AgreementService, AgreementInteractor],
  exports: [],
})
export class AgreementModule {}
