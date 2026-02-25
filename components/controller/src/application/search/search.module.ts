import { Module } from '@nestjs/common';
import { SearchResolver } from './resolvers/search.resolver';
import { SearchEventService } from './services/search-event.service';

@Module({
  providers: [SearchResolver, SearchEventService],
})
export class SearchModule {}
