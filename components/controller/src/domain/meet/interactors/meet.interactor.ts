import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Inject, Injectable } from '@nestjs/common';
import { MEET_BLOCKCHAIN_PORT, MeetBlockchainPort } from '../ports/meet-blockchain.port';
import {
  MEET_PRE_PROCESSING_REPOSITORY,
  MeetPreProcessingRepository,
  MEET_REPOSITORY,
} from '../repositories/meet-pre.repository';
import { MeetAggregate } from '../aggregates/meet-domain.aggregate';
import type { CreateAnnualGeneralMeetInputDomainInterface } from '../interfaces/create-annual-meet-input-domain.interface';
import { DocumentAggregator } from '~/domain/document/aggregators/document.aggregator';
import { MeetPreProcessingDomainEntity } from '../entities/meet-pre-domain.entity';
import { VoteOnAnnualGeneralMeetInputDomainInterface } from '../interfaces/vote-on-annual-general-meet-input.interface';
import { RestartAnnualGeneralMeetInputDomainInterface } from '../interfaces/restart-annual-general-meet-input-domain.interface';
import { GetMeetInputDomainInterface } from '../interfaces/get-meet-input-domain.interface';
import { GetMeetsInputDomainInterface } from '../interfaces/get-meets-input-domain.interface';
import { SignBySecretaryOnAnnualGeneralMeetInputDomainInterface } from '../interfaces/sign-by-secretary-on-annual-general-meet-input-domain.interface';
import { SignByPresiderOnAnnualGeneralMeetInputDomainInterface } from '../interfaces/sign-by-presider-on-annual-general-meet-input-domain.interface';
import { MEET_PROCESSED_REPOSITORY, MeetProcessedRepository } from '../repositories/meet-processed.repository';
import { ProcessMeetDecisionInputDomainInterface } from '../interfaces/process-meet-decision-input-domain.interface';
import { MeetProcessedDomainEntity } from '../entities/meet-processed-domain.entity';
import { DocumentAggregationService } from '~/domain/document/services/document-aggregation.service';
import type { MeetProcessedDomainInterface } from '../interfaces/meet-processed-domain.interface';
import { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';

@Injectable()
export class MeetDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    private readonly documentAggregationService: DocumentAggregationService,
    @Inject(MEET_REPOSITORY) private readonly meetPreRepository: MeetPreProcessingRepository,
    @Inject(MEET_PROCESSED_REPOSITORY) private readonly meetProcessedRepository: MeetProcessedRepository,
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
    await this.meetPreRepository.create(preProcessing);

    // Вызов блокчейн порта для создания собрания
    await this.meetBlockchainPort.createMeet(data);

    // Получаем обновленные данные из блокчейна
    const processingData = await this.meetBlockchainPort.getMeet({
      coopname: data.coopname,
      hash: preProcessing.hash,
    });

    // Получаем сохраненные данные из репозитория
    const preMeet = await this.meetPreRepository.findByHash(preProcessing.hash);

    // Создаем агрегат из обоих источников данных (репозиторий и блокчейн)
    return new MeetAggregate(preMeet, processingData);
  }

  async generateAnnualGeneralMeetDecisionDocument(
    data: Cooperative.Registry.AnnualGeneralMeetingDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateAnnualGeneralMeetNotificationDocument(
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

  async generateBallotForAnnualGeneralMeet(
    data: Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async getMeet(data: GetMeetInputDomainInterface, username?: string): Promise<MeetAggregate> {
    // Получаем данные из блокчейна через порт
    const processingMeet = await this.meetBlockchainPort.getMeet({
      coopname: data.coopname,
      hash: data.hash,
      username,
    });

    // Получаем данные из репозитория
    const preMeet = await this.meetPreRepository.findByHash(data.hash);

    // Получаем данные из репозитория обработанных собраний
    const processedMeetEntity = await this.meetProcessedRepository.findByHash(data.hash);

    // Создаем агрегат из обоих источников данных (репозиторий и блокчейн)
    const meetAggregate = new MeetAggregate(preMeet, processingMeet, processedMeetEntity);

    // Вернем готовый агрегат
    return meetAggregate;
  }

  async getMeets(data: GetMeetsInputDomainInterface, username?: string): Promise<MeetAggregate[]> {
    // Получаем данные из блокчейна через порт
    const processingDataList = await this.meetBlockchainPort.getMeets({
      coopname: data.coopname,
      username,
    });

    // Если данных нет, возвращаем пустой массив
    if (!processingDataList || processingDataList.length === 0) {
      return [];
    }

    // Преобразуем данные в агрегаты, получая для каждого элемента данные из репозитория
    const meetsAggregates = await Promise.all(
      processingDataList.map(async (processingData) => {
        // Получаем данные pre из репозитория для каждого элемента по его хешу
        const preMeet = await this.meetPreRepository.findByHash(processingData.hash);

        // Получаем данные processed из репозитория
        const processedMeetEntity = await this.meetProcessedRepository.findByHash(processingData.hash);

        // Создаем агрегат с данными из репозитория и блокчейна
        return new MeetAggregate(preMeet, processingData, processedMeetEntity);
      })
    );

    return meetsAggregates;
  }

  async vote(data: VoteOnAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    // Вызов блокчейн порта для голосования
    await this.meetBlockchainPort.vote(data);

    // Получаем обновленные данные из обоих источников
    const processingData = await this.meetBlockchainPort.getMeet({
      coopname: data.coopname,
      hash: data.hash,
      username: data.username,
    });

    const preMeet = await this.meetPreRepository.findByHash(data.hash);
    const processedMeetEntity = await this.meetProcessedRepository.findByHash(data.hash);

    // Создаем агрегат из обоих источников данных
    return new MeetAggregate(preMeet, processingData, processedMeetEntity);
  }

  async restartMeet(data: RestartAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    // Вызов блокчейн порта для перезапуска собрания
    await this.meetBlockchainPort.restartMeet(data);

    // Получаем обновленные данные из обоих источников
    const processingData = await this.meetBlockchainPort.getMeet({
      coopname: data.coopname,
      hash: data.hash,
    });

    const preMeet = await this.meetPreRepository.findByHash(data.hash);
    const processedMeetEntity = await this.meetProcessedRepository.findByHash(data.hash);

    // Создаем агрегат из обоих источников данных
    return new MeetAggregate(preMeet, processingData, processedMeetEntity);
  }

  async signBySecretaryOnAnnualGeneralMeet(
    data: SignBySecretaryOnAnnualGeneralMeetInputDomainInterface
  ): Promise<MeetAggregate> {
    await this.meetBlockchainPort.signBySecretaryOnAnnualGeneralMeet(data);
    const processingData = await this.meetBlockchainPort.getMeet({
      coopname: data.coopname,
      hash: data.hash,
      username: data.username,
    });
    const preMeet = await this.meetPreRepository.findByHash(data.hash);
    const processedMeetEntity = await this.meetProcessedRepository.findByHash(data.hash);

    return new MeetAggregate(preMeet, processingData, processedMeetEntity);
  }

  async signByPresiderOnAnnualGeneralMeet(
    data: SignByPresiderOnAnnualGeneralMeetInputDomainInterface
  ): Promise<MeetAggregate> {
    await this.meetBlockchainPort.signByPresiderOnAnnualGeneralMeet(data);
    const processingData = await this.meetBlockchainPort.getMeet({
      coopname: data.coopname,
      hash: data.hash,
      username: data.username,
    });
    const preMeet = await this.meetPreRepository.findByHash(data.hash);
    const processedMeetEntity = await this.meetProcessedRepository.findByHash(data.hash);

    return new MeetAggregate(preMeet, processingData, processedMeetEntity);
  }

  /**
   * Обработка события о завершенном общем собрании и его результатах
   * @param data Данные о решении общего собрания
   */
  async processMeetDecision(data: ProcessMeetDecisionInputDomainInterface): Promise<void> {
    // Создаем сущность для обработанных данных собрания
    const processedEntity = new MeetProcessedDomainEntity({
      ...data.decisionData,
    });

    // Сохраняем данные в репозиторий
    await this.meetProcessedRepository.save(processedEntity);
  }
}
