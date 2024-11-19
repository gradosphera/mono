import type { SovietContract } from 'cooptypes';
import { BranchDomainEntity } from '../entities/branch-domain.entity';
import type { GetBranchesDomainInput } from './get-branches-input.interface';

export interface BranchBlockchainPort {
  // registerBranch(data: { name: string; trustee: string }): Promise<void>;
  // updateBranch(data: { name: string; trustee: string }): Promise<void>;
  getBranches(coopname: string): Promise<SovietContract.Tables.Branches.IBranch[]>;
  getBranch(coopname: string, braname: string): Promise<SovietContract.Tables.Branches.IBranch>;
  // addTrustee(): Promise<void>;
  // deleteTrustee(): Promise<void>;
}

export const BRANCH_BLOCKCHAIN_PORT = Symbol('BranchBlockchainPort');
