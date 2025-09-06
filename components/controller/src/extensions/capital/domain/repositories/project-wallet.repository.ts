import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { ProjectWalletDomainEntity } from '../entities/project-wallet.entity';

export type ProjectWalletRepository = IBlockchainSyncRepository<ProjectWalletDomainEntity>;

export const PROJECT_WALLET_REPOSITORY = Symbol('ProjectWalletRepository');
