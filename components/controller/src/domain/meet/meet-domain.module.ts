// domain/appstore/appstore-domain.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { MeetDomainInteractor } from './interactors/meet.interactor';
import { MeetEventService } from './services/meet-event.service';
import { DocumentDomainModule } from '../document/document.module';
import { MeetInfrastructureModule } from '~/infrastructure/meet/meet-infrastructure.module';

@Module({
  imports: [DocumentDomainModule, forwardRef(() => MeetInfrastructureModule)],
  providers: [MeetDomainInteractor, MeetEventService],
  exports: [MeetDomainInteractor],
})
export class MeetDomainModule {}
