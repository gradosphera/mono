import { Module } from '@nestjs/common';
import { DocumentDomainModule } from '../document/document.module';
import { AgendaDomainInteractor } from './interactors/agenda-domain.interactor';

@Module({
  imports: [DocumentDomainModule],
  providers: [AgendaDomainInteractor],
  exports: [AgendaDomainInteractor],
})
export class AgendaDomainModule {}
