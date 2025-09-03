// domain/appstore/appstore-domain.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { MeetDomainInteractor } from './interactors/meet.interactor';
import { MeetEventService } from './services/meet-event.service';
import { DocumentDomainModule } from '../document/document.module';
import { ExtensionPortsModule } from '../extension/extension-ports.module';

@Module({
  imports: [DocumentDomainModule, forwardRef(() => ExtensionPortsModule)],
  providers: [MeetDomainInteractor, MeetEventService],
  exports: [MeetDomainInteractor],
})
export class MeetDomainModule {}
