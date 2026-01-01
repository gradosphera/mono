import { Module } from '@nestjs/common';
import { MeetDataAdapter } from './meet-data.adapter';
import { MEET_DATA_PORT } from '~/domain/meet/ports/meet-data.port';
import { MeetDomainModule } from '~/domain/meet/meet-domain.module';
import { DatabaseModule } from '../database/database.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DocumentDomainModule } from '~/domain/document/document.module';

@Module({
  imports: [MeetDomainModule, DatabaseModule, BlockchainModule, DocumentDomainModule],
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
