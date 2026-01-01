import type { MeetAggregate } from '~/domain/meet/aggregates/meet-domain.aggregate';
import { GetMeetInputDomainInterface } from '~/domain/meet/interfaces/get-meet-input-domain.interface';
import { GetMeetsInputDomainInterface } from '~/domain/meet/interfaces/get-meets-input-domain.interface';
import { CreateAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/create-annual-meet-input-domain.interface';

/**
 * Доменный порт для получения данных собраний
 * Используется расширениями для доступа к данным собраний
 */
export interface MeetDataPort {
  getMeets(data: GetMeetsInputDomainInterface, username?: string): Promise<MeetAggregate[]>;
  getMeet(data: GetMeetInputDomainInterface, username?: string): Promise<MeetAggregate>;
  createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate>;
}

export const MEET_DATA_PORT = Symbol('MeetDataPort');
