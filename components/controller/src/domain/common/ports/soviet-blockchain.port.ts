import { SovietContract } from 'cooptypes';
import type { TransactResult } from '@wharfkit/session';

export interface SovietBlockchainPort {
  getDecisions(coopname: string): Promise<SovietContract.Tables.Decisions.IDecision[]>;
  getDecision(coopname: string, decision_id: string): Promise<SovietContract.Tables.Decisions.IDecision | null>;

  publishProjectOfFreeDecision(
    data: SovietContract.Actions.Decisions.CreateFreeDecision.ICreateFreeDecision
  ): Promise<TransactResult>;

  cancelExpiredDecision(data: SovietContract.Actions.Decisions.Cancelexprd.ICancelExpired): Promise<TransactResult>;
}

export const SOVIET_BLOCKCHAIN_PORT = Symbol('SovietBlockchainPort');
