import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { DocumentModule } from '../document/document.module';
import { MeetResolver } from './resolvers/meet.resolver';
import { MeetService } from './services/meet.service';
import { AgendaNotificationService } from '../agenda/services/agenda-notification.service';
import { DecisionNotificationService } from '../agenda/services/decision-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';

@Module({
  imports: [DomainModule, DocumentModule, NovuModule],
  controllers: [],
  providers: [MeetResolver, MeetService, AgendaNotificationService, DecisionNotificationService],
  exports: [AgendaNotificationService, DecisionNotificationService],
})
export class MeetModule {}
