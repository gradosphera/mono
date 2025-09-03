import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { DocumentResolver } from './resolvers/document.resolver';
import { DocumentService } from './services/document.service';

@Module({
  imports: [DomainModule],
  providers: [DocumentResolver, DocumentService],
  exports: [],
})
export class DocumentModule {}
