import { Module } from '@nestjs/common';
import { CooplaceResolver } from './resolvers/cooplace.resolver';
import { CooplaceService } from './services/cooplace.service';
import { CooplaceDomainModule } from '~/domain/cooplace/cooplace.module';

@Module({
  imports: [CooplaceDomainModule],
  providers: [CooplaceResolver, CooplaceService],
  exports: [],
})
export class CooplaceModule {}
