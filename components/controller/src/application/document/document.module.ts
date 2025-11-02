import { Module } from '@nestjs/common';
import { DocumentResolver } from './resolvers/document.resolver';
import { DocumentService } from './services/document.service';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [DocumentDomainModule],
  providers: [DocumentResolver, DocumentService],
  exports: [],
})
export class DocumentModule {}
