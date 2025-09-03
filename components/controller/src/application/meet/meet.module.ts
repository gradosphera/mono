import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';
import { DocumentModule } from '../document/document.module';
import { MeetResolver } from './resolvers/meet.resolver';
import { MeetService } from './services/meet.service';

@Module({
  imports: [DomainModule, DocumentModule],
  controllers: [],
  providers: [MeetResolver, MeetService],
  exports: [],
})
export class MeetModule {}
