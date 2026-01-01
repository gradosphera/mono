import { Module } from '@nestjs/common';
import { DocumentResolver } from './resolvers/document.resolver';
import { DocumentService } from './services/document.service';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { DocumentInteractor } from './interactors/document.interactor';

@Module({
  imports: [DocumentDomainModule],
  providers: [DocumentResolver, DocumentService, DocumentInteractor],
  exports: [DocumentInteractor],
})
export class DocumentModule {}
