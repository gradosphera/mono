import type { MeetAggregate } from '~/domain/meet/aggregates/meet-domain.aggregate';
import { GetMeetInputDomainInterface } from '~/domain/meet/interfaces/get-meet-input-domain.interface';
import { GetMeetsInputDomainInterface } from '~/domain/meet/interfaces/get-meets-input-domain.interface';
import { CreateAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/create-annual-meet-input-domain.interface';

export interface MeetExtensionPort {
  getMeets(data: GetMeetsInputDomainInterface, username?: string): Promise<MeetAggregate[]>;
  getMeet(data: GetMeetInputDomainInterface, username?: string): Promise<MeetAggregate>;
  createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate>;
}

export const MEET_EXTENSION_PORT = Symbol('MeetExtensionPort');
