import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { MeetExtensionPort } from '../ports/meet-extension-port';
import { MeetDomainInteractor } from '~/domain/meet/interactors/meet.interactor';
import type { MeetAggregate } from '~/domain/meet/aggregates/meet-domain.aggregate';
import { GetMeetInputDomainInterface } from '~/domain/meet/interfaces/get-meet-input-domain.interface';
import { GetMeetsInputDomainInterface } from '~/domain/meet/interfaces/get-meets-input-domain.interface';
import { CreateAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/create-annual-meet-input-domain.interface';

@Injectable()
export class MeetExtensionAdapter implements MeetExtensionPort {
  constructor(@Inject(forwardRef(() => MeetDomainInteractor)) private readonly meetInteractor: MeetDomainInteractor) {}

  async getMeets(data: GetMeetsInputDomainInterface, username?: string): Promise<MeetAggregate[]> {
    return this.meetInteractor.getMeets(data, username);
  }

  async getMeet(data: GetMeetInputDomainInterface, username?: string): Promise<MeetAggregate> {
    return this.meetInteractor.getMeet(data, username);
  }

  async createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    return this.meetInteractor.createAnnualGeneralMeet(data);
  }
}
