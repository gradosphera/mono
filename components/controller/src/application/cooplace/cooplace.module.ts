import { Module } from '@nestjs/common';
import { CooplaceResolver } from './resolvers/cooplace.resolver';
import { CooplaceService } from './services/cooplace.service';
import { CooplaceInteractor } from './interactors/cooplace.interactor';
import { CooplaceDomainModule } from '~/domain/cooplace/cooplace.module';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [CooplaceDomainModule, DocumentDomainModule],
  providers: [CooplaceInteractor, CooplaceResolver, CooplaceService],
  exports: [],
})
export class CooplaceModule {}
