import { SovietContract } from 'cooptypes';
import type { TransactResult } from '@wharfkit/session';

export interface DecisionBlockchainPort {
  getProjects(coopname: string): Promise<SovietContract.Tables.Decisions.IDecision[]>;
  getProject(coopname: string, decision_id: string): Promise<SovietContract.Tables.Decisions.IDecision | null>;

  publichProjectOfFreeDecision(
    data: SovietContract.Actions.Decisions.CreateFreeDecision.ICreateFreeDecision
  ): Promise<TransactResult>;
}

export const DECISION_BLOCKCHAIN_PORT = Symbol('DecisionBlockchainPort');
