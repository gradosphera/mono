import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { ParticipantResolver } from './resolvers/participant.resolver';
import { ParticipantService } from './services/participant.service';
import { ParticipantNotificationService } from './services/participant-notification.service';
import { NovuModule } from '~/infrastructure/novu/novu.module';

@Module({
  imports: [DomainModule, NovuModule],
  controllers: [],
  providers: [ParticipantResolver, ParticipantService, ParticipantNotificationService],
  exports: [ParticipantNotificationService],
})
export class ParticipantModule {}
