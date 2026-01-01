import { Module, forwardRef } from '@nestjs/common';
import { MeetDataAdapter } from './meet-data.adapter';
import { MEET_DATA_PORT } from '~/domain/meet/ports/meet-data.port';
import { MeetDomainModule } from '~/domain/meet/meet-domain.module';

@Module({
  imports: [forwardRef(() => MeetDomainModule)],
  providers: [
    MeetDataAdapter,
    {
      provide: MEET_DATA_PORT,
      useClass: MeetDataAdapter,
    },
  ],
  exports: [MeetDataAdapter, MEET_DATA_PORT],
})
export class MeetInfrastructureModule {}
