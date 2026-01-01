import { Module } from '@nestjs/common';
import { DocumentDataAdapter } from './document-data.adapter';
import { DOCUMENT_DATA_PORT } from '~/domain/document/ports/document-data.port';
import { DocumentDomainModule } from '~/domain/document/document.module';
import { DocumentModule } from '~/application/document/document.module';

@Module({
  imports: [DocumentDomainModule, DocumentModule],
  providers: [
    DocumentDataAdapter,
    {
      provide: DOCUMENT_DATA_PORT,
      useClass: DocumentDataAdapter,
    },
  ],
  exports: [DocumentDataAdapter, DOCUMENT_DATA_PORT],
})
export class DocumentInfrastructureModule {}
