import { Injectable } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { type CreateAnnualGeneralMeetInputDTO } from '../dto/create-meet-agenda-input.dto';
import type {
  AnnualGeneralMeetingAgendaDocumentDTO,
  AnnualGeneralMeetingAgendaGenerateDocumentInputDTO,
} from '../../document/documents-dto/annual-general-meeting-agenda-document.dto';
import { MeetDomainInteractor } from '~/domain/meet/interactors/meet.interactor';
import type { MeetAggregateDTO } from '../dto/meet-aggregate.dto';
import { VoteOnAnnualGeneralMeetInputDTO } from '../dto/vote-on-annual-general-meet-input.dto';
import { RestartAnnualGeneralMeetInputDTO } from '../dto/restart-annual-general-meet-input.dto';
import { CloseAnnualGeneralMeetInputDTO } from '../dto/close-annual-general-meet-input.dto';
import { GenerateSovietDecisionOnAnnualMeetInputDTO } from '../dto/generate-soviet-decision-input.dto';
import { AnnualGeneralMeetingSovietDecisionDocumentDTO } from '../../document/documents-dto/annual-general-meeting-soviet-decision-document.dto';
import { Cooperative } from 'cooptypes';

@Injectable()
export class MeetService {
  constructor(private readonly meetDomainInteractor: MeetDomainInteractor) {}

  public async generateAnnualGeneralMeetAgendaDocument(
    data: AnnualGeneralMeetingAgendaGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<AnnualGeneralMeetingAgendaDocumentDTO> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingAgenda.registry_id;

    const document = await this.meetDomainInteractor.generateAnnualGeneralMeetAgendaDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as AnnualGeneralMeetingAgendaDocumentDTO;
  }

  public async createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.createAnnualGeneralMeet(data);
    return aggregate;
  }

  public async generateSovietDecisionOnAnnualMeetDocument(
    data: GenerateSovietDecisionOnAnnualMeetInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<AnnualGeneralMeetingSovietDecisionDocumentDTO> {
    // Используем доменный объект, который возвращается из toDomain
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id;

    const document = await this.meetDomainInteractor.generateSovietDecisionOnAnnualMeetDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as AnnualGeneralMeetingSovietDecisionDocumentDTO;
  }

  public async vote(data: VoteOnAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.vote(data);
    return aggregate;
  }

  public async restartMeet(data: RestartAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.restartMeet(data);
    return aggregate;
  }

  public async closeMeet(data: CloseAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.closeMeet(data);
    return aggregate;
  }
}
