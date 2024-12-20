import { Module } from '@nestjs/common';
import { DocumentInteractor } from './interactors/document.interactor';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';
import { DocumentDomainService } from './services/document-domain.service';

@Module({
  imports: [InfrastructureModule],
  providers: [DocumentInteractor, DocumentDomainService],
  exports: [DocumentInteractor, DocumentDomainService],
})
export class DocumentDomainModule {}
