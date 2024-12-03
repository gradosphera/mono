import { BranchContract } from 'cooptypes';
import type { TransactResult } from '@wharfkit/session';

export interface BranchBlockchainPort {
  createBranch(data: BranchContract.Actions.CreateBranch.ICreateBranch): Promise<TransactResult>;
  editBranch(data: BranchContract.Actions.EditBranch.IEditBranch): Promise<TransactResult>;
  getBranches(coopname: string): Promise<BranchContract.Tables.Branches.IBranch[]>;
  getBranch(coopname: string, braname: string): Promise<BranchContract.Tables.Branches.IBranch | null>;
  deleteBranch(data: BranchContract.Actions.DeleteBranch.IDeleteBranch): Promise<TransactResult>;
  addTrustedAccount(data: BranchContract.Actions.AddTrusted.IAddTrusted): Promise<TransactResult>;
  deleteTrustedAccount(data: BranchContract.Actions.DeleteTrusted.IDeleteTrusted): Promise<TransactResult>;
}

export const BRANCH_BLOCKCHAIN_PORT = Symbol('BranchBlockchainPort');
