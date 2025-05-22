import { Injectable } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { type CreateAnnualGeneralMeetInputDTO } from '../dto/create-meet-agenda-input.dto';
import type { AnnualGeneralMeetingAgendaGenerateDocumentInputDTO } from '../../document/documents-dto/annual-general-meeting-agenda-document.dto';
import { MeetDomainInteractor } from '~/domain/meet/interactors/meet.interactor';
import { MeetAggregateDTO } from '../dto/meet-aggregate.dto';
import { VoteOnAnnualGeneralMeetInputDTO } from '../dto/vote-on-annual-general-meet-input.dto';
import { RestartAnnualGeneralMeetInputDTO } from '../dto/restart-annual-general-meet-input.dto';
import { Cooperative } from 'cooptypes';
import { GetMeetInputDTO } from '../dto/get-meet-input.dto';
import { GetMeetsInputDTO } from '../dto/get-meets-input.dto';
import { SignBySecretaryOnAnnualGeneralMeetInputDTO } from '../dto/sign-by-secretary-on-annual-general-meet-input.dto';
import { SignByPresiderOnAnnualGeneralMeetInputDTO } from '../dto/sign-by-presider-on-annual-general-meet-input.dto';
import type { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { AnnualGeneralMeetingVotingBallotGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-voting-ballot-document.dto';
import { AnnualGeneralMeetingSovietDecisionGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-soviet-decision-document.dto';
import { AnnualGeneralMeetingDecisionGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-decision-document.dto';
import { AnnualGeneralMeetingNotificationGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-notification-document.dto';
import { MeetAggregate } from '~/domain/meet/aggregates/meet-domain.aggregate';
import { DocumentAggregationService } from '~/domain/document/services/document-aggregation.service';
import { DocumentDomainAggregate } from '~/domain/document/aggregates/document-domain.aggregate';

@Injectable()
export class MeetService {
  constructor(
    private readonly meetDomainInteractor: MeetDomainInteractor,
    private readonly documentAggregationService: DocumentAggregationService
  ) {}

  /**
   * Преобразует домен-объект в DTO с обогащением документов
   */
  private async toDTO(aggregate: MeetAggregate): Promise<MeetAggregateDTO> {
    // Получаем агрегат документа решения для processed
    let decisionAggregate: DocumentDomainAggregate | null = null;
    if (aggregate.processed?.decision) {
      decisionAggregate = await this.documentAggregationService.buildDocumentAggregate(aggregate.processed.decision);
    }

    // Получаем агрегаты документов для processing
    const processingDocuments = aggregate.processing?.meet
      ? {
          proposalAggregate: aggregate.processing.meet.proposal
            ? await this.documentAggregationService.buildDocumentAggregate(aggregate.processing.meet.proposal)
            : null,
          authorizationAggregate: aggregate.processing.meet.authorization
            ? await this.documentAggregationService.buildDocumentAggregate(aggregate.processing.meet.authorization)
            : null,
          decision1Aggregate: aggregate.processing.meet.decision1
            ? await this.documentAggregationService.buildDocumentAggregate(aggregate.processing.meet.decision1)
            : null,
          decision2Aggregate: aggregate.processing.meet.decision2
            ? await this.documentAggregationService.buildDocumentAggregate(aggregate.processing.meet.decision2)
            : null,
        }
      : undefined;

    // Создаем DTO с обогащенными документами
    return new MeetAggregateDTO(aggregate, decisionAggregate, processingDocuments);
  }

  public async generateAnnualGeneralMeetAgendaDocument(
    data: AnnualGeneralMeetingAgendaGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа повестки
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingAgenda.registry_id;

    const document = await this.meetDomainInteractor.generateAnnualGeneralMeetAgendaDocument(data, options || {});
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.createAnnualGeneralMeet(data);
    return await this.toDTO(aggregate);
  }

  public async generateAnnualGeneralMeetDecisionDocument(
    data: AnnualGeneralMeetingDecisionGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа решения
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingDecision.registry_id;

    const document = await this.meetDomainInteractor.generateAnnualGeneralMeetDecisionDocument(data, options || {});
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateAnnualGeneralMeetNotificationDocument(
    data: AnnualGeneralMeetingNotificationGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа уведомления
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingNotification.registry_id;

    const document = await this.meetDomainInteractor.generateAnnualGeneralMeetNotificationDocument(data, options || {});
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateSovietDecisionOnAnnualMeetDocument(
    data: AnnualGeneralMeetingSovietDecisionGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа решения совета
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id;

    const document = await this.meetDomainInteractor.generateSovietDecisionOnAnnualMeetDocument(data, options || {});
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async generateBallotForAnnualGeneralMeet(
    data: AnnualGeneralMeetingVotingBallotGenerateDocumentInputDTO,
    options?: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    // Устанавливаем registry_id для документа бюллетеня
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.registry_id;

    const document = await this.meetDomainInteractor.generateBallotForAnnualGeneralMeet(data, options || {});
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }

  public async getMeet(data: GetMeetInputDTO, username?: string): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.getMeet(data, username);
    return await this.toDTO(aggregate);
  }

  public async getMeets(data: GetMeetsInputDTO, username?: string): Promise<MeetAggregateDTO[]> {
    const aggregates = await this.meetDomainInteractor.getMeets(data, username);
    return await Promise.all(aggregates.map((aggregate) => this.toDTO(aggregate)));
  }

  public async vote(data: VoteOnAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.vote(data);
    return await this.toDTO(aggregate);
  }

  public async restartMeet(data: RestartAnnualGeneralMeetInputDTO): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.restartMeet(data);
    return await this.toDTO(aggregate);
  }

  public async signBySecretaryOnAnnualGeneralMeet(
    data: SignBySecretaryOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.signBySecretaryOnAnnualGeneralMeet(data);
    return await this.toDTO(aggregate);
  }

  public async signByPresiderOnAnnualGeneralMeet(
    data: SignByPresiderOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    const aggregate = await this.meetDomainInteractor.signByPresiderOnAnnualGeneralMeet(data);
    return await this.toDTO(aggregate);
  }
}
