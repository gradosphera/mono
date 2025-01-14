import { Module } from '@nestjs/common';
import { DocumentDomainModule } from '../document/document.module';
import { AgreementDomainInteractor } from './interactors/agreement-domain.interactor';

@Module({
  imports: [DocumentDomainModule],
  providers: [AgreementDomainInteractor],
  exports: [AgreementDomainInteractor],
})
export class AgreementDomainModule {}
