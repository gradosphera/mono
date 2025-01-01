import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { ParticipantResolver } from './resolvers/participant.resolver';
import { ParticipantService } from './services/participant.service';

@Module({
  imports: [DomainModule],
  controllers: [],
  providers: [ParticipantResolver, ParticipantService],
  exports: [],
})
export class ParticipantModule {}
