import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { AppendixDomainEntity } from '../entities/appendix.entity';

export type AppendixRepository = IBlockchainSyncRepository<AppendixDomainEntity>;

export const APPENDIX_REPOSITORY = Symbol('AppendixRepository');
