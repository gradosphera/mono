import { Module, Global, forwardRef } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BRANCH_BLOCKCHAIN_PORT } from '~/domain/branch/interfaces/branch-blockchain.port';
import { BLOCKCHAIN_PORT } from '~/domain/common/ports/blockchain.port';
import { BranchBlockchainAdapter } from './adapters/branch.adapter';
import { SystemBlockchainAdapter } from './adapters/system.adapter';
import { SYSTEM_BLOCKCHAIN_PORT } from '~/domain/system/interfaces/system-blockchain.port';
import { ACCOUNT_BLOCKCHAIN_PORT } from '~/domain/account/interfaces/account-blockchain.port';
import { AccountBlockchainAdapter } from './adapters/account.adapter';
import { DecisionBlockchainAdapter } from './adapters/free-decision-blockchain.adapter';
import { FREE_DECISION_BLOCKCHAIN_PORT } from '~/domain/free-decision/interfaces/free-decision-blockchain.port';
import { COOPLACE_BLOCKCHAIN_PORT } from '~/domain/cooplace/interfaces/cooplace-blockchain.port';
import { CooplaceBlockchainAdapter } from './adapters/cooplace-blockchain.adapter';
import { MEET_BLOCKCHAIN_PORT } from '~/domain/meet/ports/meet-blockchain.port';
import { MeetBlockchainAdapter } from './adapters/meet-blockchain.adapter';
import { DomainToBlockchainUtils } from './utils/domain-to-blockchain.utils';
import { DomainModule } from '~/domain/domain.module';

@Global()
@Module({
  imports: [forwardRef(() => DomainModule)],
  providers: [
    BlockchainService,
    {
      provide: BLOCKCHAIN_PORT,
      useClass: BlockchainService,
    },
    {
      provide: BRANCH_BLOCKCHAIN_PORT,
      useClass: BranchBlockchainAdapter,
    },
    {
      provide: SYSTEM_BLOCKCHAIN_PORT,
      useClass: SystemBlockchainAdapter,
    },
    {
      provide: ACCOUNT_BLOCKCHAIN_PORT,
      useClass: AccountBlockchainAdapter,
    },
    {
      provide: FREE_DECISION_BLOCKCHAIN_PORT,
      useClass: DecisionBlockchainAdapter,
    },
    {
      provide: COOPLACE_BLOCKCHAIN_PORT,
      useClass: CooplaceBlockchainAdapter,
    },
    {
      provide: MEET_BLOCKCHAIN_PORT,
      useClass: MeetBlockchainAdapter,
    },
    DomainToBlockchainUtils,
  ],
  exports: [
    BLOCKCHAIN_PORT,
    BRANCH_BLOCKCHAIN_PORT,
    SYSTEM_BLOCKCHAIN_PORT,
    ACCOUNT_BLOCKCHAIN_PORT,
    FREE_DECISION_BLOCKCHAIN_PORT,
    COOPLACE_BLOCKCHAIN_PORT,
    MEET_BLOCKCHAIN_PORT,
    DomainToBlockchainUtils,
  ],
})
export class BlockchainModule {}
