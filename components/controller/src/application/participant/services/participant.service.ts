import { Injectable } from '@nestjs/common';
import type { AddParticipantInputDTO } from '../dto/add-participant-input.dto';
import { AccountDTO } from '~/application/account/dto/account.dto';
import { generateUsername } from '~/utils/generate-username';
import { RegisterRole } from '~/application/account/enum/account-role-on-register.enum';
import { ParticipantInteractor } from '../interactors/participant.interactor';

@Injectable()
export class ParticipantService {
  constructor(private readonly participantInteractor: ParticipantInteractor) {}

  public async addParticipant(data: AddParticipantInputDTO): Promise<AccountDTO> {
    const result = await this.participantInteractor.addParticipant({
      ...data,
      username: generateUsername(),
      role: RegisterRole.User,
    });
    return new AccountDTO(result);
  }
}
