import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Inject, Injectable } from '@nestjs/common';
import { MEET_BLOCKCHAIN_PORT, MeetBlockchainPort } from '../ports/meet-blockchain.port';
import { MEET_REPOSITORY, MeetRepository } from '../repositories/meet.repository';
import { MeetAggregate } from '../aggregates/meet-domain.aggregate';
import type { CreateAnnualGeneralMeetInputDomainInterface } from '../interfaces/create-annual-meet-input-domain.interface';
import { DocumentAggregator } from '~/domain/document/aggregators/document.aggregator';
import { MeetPreProcessingDomainEntity } from '../entities/meet-pre-domain.entity';
import { VoteOnAnnualGeneralMeetInputDomainInterface } from '../interfaces/vote-on-annual-general-meet-input.interface';
import { RestartAnnualGeneralMeetInputDomainInterface } from '../interfaces/restart-annual-general-meet-input-domain.interface';
import { CloseAnnualGeneralMeetInputDomainInterface } from '../interfaces/close-annual-general-meet-input-domain.interface';

@Injectable()
export class MeetDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(MEET_REPOSITORY) private readonly meetRepository: MeetRepository,
    @Inject(MEET_BLOCKCHAIN_PORT) private readonly meetBlockchainPort: MeetBlockchainPort,
    private readonly documentAggregator: DocumentAggregator
  ) {}

  async generateAnnualGeneralMeetAgendaDocument(
    data: Cooperative.Registry.AnnualGeneralMeetingAgenda.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingAgenda.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    // Создаем агрегатор документов с помощью агрегатора документов
    const documentAggregate = await this.documentAggregator.buildDocumentAggregate(data.proposal);
    const preProcessing = new MeetPreProcessingDomainEntity({ ...data, proposal: documentAggregate });

    // Сохраняем данные в репозиторий
    await this.meetRepository.create(preProcessing);

    const preMeet = await this.meetRepository.findByHash(preProcessing.hash);

    return new MeetAggregate(preMeet);
  }

  async generateAnnualGeneralMeetDecisionDocument(
    data: Cooperative.Registry.AnnualGeneralMeetingDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateAnnualMeetNotificationDocument(
    data: Cooperative.Registry.AnnualGeneralMeetingNotification.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingNotification.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateSovietDecisionOnAnnualMeetDocument(
    data: Cooperative.Registry.AnnualGeneralMeetingSovietDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async vote(data: VoteOnAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    // Вызов блокчейн порта для голосования
    await this.meetBlockchainPort.vote(data);

    // Получаем обновленные данные из репозитория
    const meet = await this.meetRepository.findByHash(data.hash);

    return new MeetAggregate(meet);
  }

  async restartMeet(data: RestartAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    // Вызов блокчейн порта для перезапуска собрания
    await this.meetBlockchainPort.restartMeet(data);

    // Получаем обновленные данные из репозитория
    const meet = await this.meetRepository.findByHash(data.hash);

    return new MeetAggregate(meet);
  }

  async closeMeet(data: CloseAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    // Вызов блокчейн порта для закрытия собрания
    await this.meetBlockchainPort.closeMeet(data);

    // Получаем обновленные данные из репозитория
    const meet = await this.meetRepository.findByHash(data.hash);

    return new MeetAggregate(meet);
  }
}
