import { Module } from '@nestjs/common';
import { DocumentDomainInteractor } from './interactors/document.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { DocumentDomainService } from './services/document-domain.service';

@Module({
  imports: [InfrastructureModule],
  providers: [DocumentDomainInteractor, DocumentDomainService],
  exports: [DocumentDomainInteractor, DocumentDomainService],
})
export class DocumentDomainModule {}
