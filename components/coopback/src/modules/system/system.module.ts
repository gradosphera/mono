import { Module } from '@nestjs/common';
import { SystemService } from './services/system.service';
import { SystemResolver } from './resolvers/system.resolver';
import { SystemDomainInteractor } from '~/domain/system/interactors/system.interactor';

@Module({
  imports: [],
  controllers: [],
  providers: [SystemDomainInteractor, SystemService, SystemResolver],
  exports: [],
})
export class SystemModule {}
