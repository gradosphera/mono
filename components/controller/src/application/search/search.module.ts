import { Module } from '@nestjs/common';
import { SearchResolver } from './resolvers/search.resolver';

@Module({
  providers: [SearchResolver],
})
export class SearchModule {}
