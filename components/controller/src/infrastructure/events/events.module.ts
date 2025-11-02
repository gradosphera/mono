// infrastructure/events/events.module.ts

import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Настройки для EventEmitter
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
  ],
  providers: [EventsService],
  exports: [EventsService, EventEmitterModule],
})
export class EventsInfrastructureModule {}
