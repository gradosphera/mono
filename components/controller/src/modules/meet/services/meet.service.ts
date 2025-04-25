import { Injectable } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { type CreateAnnualGeneralMeetInputDTO } from '../dto/create-meet-agenda-input.dto';
import type { AnnualGeneralMeetingAgendaGenerateDocumentInputDTO } from '../../document/documents-dto/annual-general-meeting-agenda-document.dto';
import { MeetDomainInteractor } from '~/domain/meet/interactors/meet.interactor';
import type { MeetAggregateDTO } from '../dto/meet-aggregate.dto';
import { VoteOnAnnualGeneralMeetInputDTO } from '../dto/vote-on-annual-general-meet-input.dto';
import { RestartAnnualGeneralMeetInputDTO } from '../dto/restart-annual-general-meet-input.dto';
import { GenerateSovietDecisionOnAnnualMeetInputDTO } from '../dto/generate-soviet-decision-input.dto';
import { Cooperative } from 'cooptypes';
import { GetMeetInputDTO } from '../dto/get-meet-input.dto';
import { GetMeetsInputDTO } from '../dto/get-meets-input.dto';
import { SignBySecretaryOnAnnualGeneralMeetInputDTO } from '../dto/sign-by-secretary-on-annual-general-meet-input.dto';
import { SignByPresiderOnAnnualGeneralMeetInputDTO } from '../dto/sign-by-presider-on-annual-general-meet-input.dto';
import { GenerateBallotForAnnualGeneralMeetInputDTO } from '../dto/generate-ballot-input.dto';
import type { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';

@Injectable()
export class MeetService {
  constructor(private readonly meetDomainInteractor: MeetDomainInteractor) {}

  public async generateAnnualGeneralMeetAgendaDocument(
    data: AnnualGeneralMeetingAgendaGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingAgenda.registry_id;

    const document = await this.meetDomainInteractor.generateAnnualGeneralMeetAgendaDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.createAnnualGeneralMeet(data);
    return aggregate;
  }

  public async generateSovietDecisionOnAnnualMeetDocument(
    data: GenerateSovietDecisionOnAnnualMeetInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Используем доменный объект, который возвращается из toDomain
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id;

    const document = await this.meetDomainInteractor.generateSovietDecisionOnAnnualMeetDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateBallotForAnnualGeneralMeet(
    data: GenerateBallotForAnnualGeneralMeetInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа бюллетеня
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.registry_id;

    const document = await this.meetDomainInteractor.generateBallotForAnnualGeneralMeet(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async getMeet(data: GetMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.getMeet(data);
    return aggregate;
  }

  public async getMeets(data: GetMeetsInputDTO): Promise<MeetAggregateDTO[]> {
    const aggregates = await this.meetDomainInteractor.getMeets(data);
    return aggregates;
  }

  public async vote(data: VoteOnAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.vote(data);
    return aggregate;
  }

  public async restartMeet(data: RestartAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.restartMeet(data);
    return aggregate;
  }

  public async signBySecretaryOnAnnualGeneralMeet(
    data: SignBySecretaryOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.signBySecretaryOnAnnualGeneralMeet(data);
    return aggregate;
  }

  public async signByPresiderOnAnnualGeneralMeet(
    data: SignByPresiderOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.signByPresiderOnAnnualGeneralMeet(data);
    return aggregate;
  }
}
