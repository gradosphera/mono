import { type MeetContract } from 'cooptypes';
import type { TransactionResult } from '~/domain/blockchain/types/transaction-result.type';
import { VoteOnAnnualGeneralMeetInputDomainInterface } from '../interfaces/vote-on-annual-general-meet-input.interface';
import { RestartAnnualGeneralMeetInputDomainInterface } from '../interfaces/restart-annual-general-meet-input-domain.interface';
import { CloseAnnualGeneralMeetInputDomainInterface } from '../interfaces/close-annual-general-meet-input-domain.interface';
import { CreateAnnualGeneralMeetInputDomainInterface } from '../interfaces/create-annual-meet-input-domain.interface';
import { GetMeetInputDomainInterface } from '../interfaces/get-meet-input-domain.interface';
import { GetMeetsInputDomainInterface } from '../interfaces/get-meets-input-domain.interface';
import { MeetProcessingDomainEntity } from '../entities/meet-processing-domain.entity';

export interface MeetBlockchainPort {
  getMeet(data: GetMeetInputDomainInterface): Promise<MeetProcessingDomainEntity | null>;
  getMeets(data: GetMeetsInputDomainInterface): Promise<MeetProcessingDomainEntity[]>;
  getQuestions(data: { coopname: string; hash: string }): Promise<MeetContract.Tables.Questions.IOutput[]>;

  createMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult>;
  vote(data: VoteOnAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult>;
  restartMeet(data: RestartAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult>;
  closeMeet(data: CloseAnnualGeneralMeetInputDomainInterface): Promise<TransactionResult>;
}

export const MEET_BLOCKCHAIN_PORT = Symbol('MeetBlockchainPort');
