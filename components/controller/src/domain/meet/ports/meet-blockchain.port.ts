import { type MeetContract } from 'cooptypes';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';

export interface MeetBlockchainPort {
  getMeet(coopname: string, hash: string): Promise<MeetContract.Tables.Meets.IOutput | null>;
  getMeets(coopname: string): Promise<MeetContract.Tables.Meets.IOutput[]>;
  getQuestions(coopname: string, decision_id: string): Promise<MeetContract.Tables.Questions.IOutput[]>;

  createMeet(data: MeetContract.Actions.CreateMeet.IInput): Promise<TransactionResult>;
  vote(data: MeetContract.Actions.CreateMeet.IInput): Promise<TransactionResult>;
  restartMeet(data: MeetContract.Actions.CreateMeet.IInput): Promise<TransactionResult>;
  closeMeet(data: MeetContract.Actions.CreateMeet.IInput): Promise<TransactionResult>;
}

export const MEET_BLOCKCHAIN_PORT = Symbol('MeetBlockchainPort');
