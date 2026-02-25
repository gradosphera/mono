import { Global, Module } from '@nestjs/common';
import { SearchRegistryService } from './search-registry.service';
import { DocumentSearchService } from './opensearch.service';

@Global()
@Module({
  providers: [SearchRegistryService, DocumentSearchService],
  exports: [SearchRegistryService, DocumentSearchService],
})
export class SearchInfrastructureModule {}
