// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { MeetDomainInteractor } from './interactors/meet.interactor';
import { DocumentDomainModule } from '../document/document.module';

@Module({
  imports: [DocumentDomainModule],
  providers: [MeetDomainInteractor],
  exports: [MeetDomainInteractor],
})
export class MeetDomainModule {}
