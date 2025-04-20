import { Injectable } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { ParticipantDomainInteractor } from '~/domain/participant/interactors/participant-domain.interactor';
import type {
  ParticipantApplicationDocumentDTO,
  ParticipantApplicationGenerateDocumentInputDTO,
} from '../../document/documents-dto/participant-application-document.dto';
import type {
  ParticipantApplicationDecisionDocumentDTO,
  ParticipantApplicationDecisionGenerateDocumentInputDTO,
} from '../../document/documents-dto/participant-application-decision-document.dto';
import type { AddParticipantInputDTO } from '../dto/add-participant-input.dto';
import { AccountDTO } from '~/modules/account/dto/account.dto';
import { generateUsername } from '~/utils/generate-username';
import { RegisterRole } from '~/modules/account/enum/account-role-on-register.enum';
import type { RegisterParticipantInputDTO } from '../dto/register-participant-input.dto';

@Injectable()
export class ParticipantService {
  constructor(private readonly participantDomainInteractor: ParticipantDomainInteractor) {}

  public async generateParticipantApplication(
    data: ParticipantApplicationGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ParticipantApplicationDocumentDTO> {
    const document = await this.participantDomainInteractor.generateParticipantApplication(data, options);
    return document as unknown as ParticipantApplicationDocumentDTO;
  }

  public async generateParticipantApplicationDecision(
    data: ParticipantApplicationDecisionGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<ParticipantApplicationDecisionDocumentDTO> {
    const document = await this.participantDomainInteractor.generateParticipantApplicationDecision(data, options);
    return document as unknown as ParticipantApplicationDecisionDocumentDTO;
  }

  public async addParticipant(data: AddParticipantInputDTO): Promise<AccountDTO> {
    const result = await this.participantDomainInteractor.addParticipant({
      ...data,
      username: generateUsername(),
      role: RegisterRole.User,
    });
    return new AccountDTO(result);
  }

  public async registerParticipant(data: RegisterParticipantInputDTO): Promise<AccountDTO> {
    const result = await this.participantDomainInteractor.registerParticipant(data);
    return new AccountDTO(result);
  }
}
