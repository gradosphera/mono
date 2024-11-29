import { SovietContract } from 'cooptypes';
import type { TransactResult } from '@wharfkit/session';

export interface BranchBlockchainPort {
  createBranch(data: SovietContract.Actions.Branches.CreateBranch.ICreateBranch): Promise<TransactResult>;
  editBranch(data: SovietContract.Actions.Branches.EditBranch.IEditBranch): Promise<TransactResult>;
  getBranches(coopname: string): Promise<SovietContract.Tables.Branches.IBranch[]>;
  getBranch(coopname: string, braname: string): Promise<SovietContract.Tables.Branches.IBranch | null>;
  deleteBranch(data: SovietContract.Actions.Branches.DeleteBranch.IDeleteBranch): Promise<TransactResult>;
  addTrustedAccount(data: SovietContract.Actions.Branches.AddTrusted.IAddTrusted): Promise<TransactResult>;
  deleteTrustedAccount(data: SovietContract.Actions.Branches.DeleteTrusted.IDeleteTrusted): Promise<TransactResult>;
}

export const BRANCH_BLOCKCHAIN_PORT = Symbol('BranchBlockchainPort');
