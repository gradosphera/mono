import { Module, Global } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BRANCH_BLOCKCHAIN_PORT } from '~/domain/branch/interfaces/branch-blockchain.port';
import { BLOCKCHAIN_PORT } from '~/domain/common/ports/blockchain.port';
import { BranchBlockchainAdapter } from './adapters/branch.adapter';
import { SystemBlockchainAdapter } from './adapters/system.adapter';
import { SYSTEM_BLOCKCHAIN_PORT } from '~/domain/system/interfaces/system-blockchain.port';
import { ACCOUNT_BLOCKCHAIN_PORT } from '~/domain/account/interfaces/account-blockchain.port';
import { AccountBlockchainAdapter } from './adapters/account.adapter';

@Global()
@Module({
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
  ],
  exports: [BLOCKCHAIN_PORT, BRANCH_BLOCKCHAIN_PORT, SYSTEM_BLOCKCHAIN_PORT, ACCOUNT_BLOCKCHAIN_PORT],
})
export class BlockchainModule {}
