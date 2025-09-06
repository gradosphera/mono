import { IBlockchainSyncRepository } from '~/shared/interfaces/blockchain-sync.interface';
import { ProgramInvestDomainEntity } from '../entities/program-invest.entity';

export type ProgramInvestRepository = IBlockchainSyncRepository<ProgramInvestDomainEntity>;

export const PROGRAM_INVEST_REPOSITORY = Symbol('ProgramInvestRepository');
