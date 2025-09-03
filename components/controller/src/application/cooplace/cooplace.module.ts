import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { CooplaceResolver } from './resolvers/cooplace.resolver';
import { CooplaceService } from './services/cooplace.service';

@Module({
  imports: [DomainModule],
  providers: [CooplaceResolver, CooplaceService],
  exports: [],
})
export class CooplaceModule {}
