import { Module } from '@nestjs/common';
import { SearchResolver } from './resolvers/search.resolver';
import { SearchEventService } from './services/search-event.service';
import { DocumentModule } from '~/application/document/document.module';

@Module({
  imports: [DocumentModule],
  providers: [SearchResolver, SearchEventService],
})
export class SearchModule {}
