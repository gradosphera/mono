import { Cooperative } from 'cooptypes';
import { DocumentDomainService } from '~/domain/document/services/document-domain.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { Inject, Injectable } from '@nestjs/common';
import { MEET_BLOCKCHAIN_PORT, MeetBlockchainPort } from '../ports/meet-blockchain.port';
import { MEET_REPOSITORY, MeetRepository } from '../repositories/meet.repository';
import type { MeetPreProcessingDomainEntity } from '../entities/meet-pre-domain.entity';
import { MeetAggregate } from '../aggregators/meet-domain.aggregate';
import type { CreateAnnualGeneralMeetInputDomainInterface } from '../interfaces/create-annual-meet-input-domain.interface';
import type { RestartAnnualGeneralMeetInputDomainInterface } from '../interfaces/close-annual-general-meet-input-domain.interface';
import type { CloseAnnualGeneralMeetInputDomainInterface } from '../interfaces/restart-annual-general-meet-input-domain.interface';
import type { VoteOnAnnualGeneralMeetInputDomainInterface } from '../interfaces/vote-on-annual-general-meet-input.interface';

@Injectable()
export class MeetDomainInteractor {
  constructor(
    private readonly documentDomainService: DocumentDomainService,
    @Inject(MEET_REPOSITORY) private readonly meetRepository: MeetRepository,
    @Inject(MEET_BLOCKCHAIN_PORT) private readonly meetBlockchainPort: MeetBlockchainPort
  ) {}

  async prepareAnnualGeneralMeet(data: MeetPreProcessingDomainEntity): Promise<MeetPreProcessingDomainEntity> {
    await this.meetRepository.create(data);
    return data;
  }

  async generateAnnualGeneralMeetAgendaDocument(
    data: Cooperative.Registry.AnnualGeneralMeetingAgenda.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingAgenda.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateAnnualGeneralMeetDecisionDocument(
    data: Cooperative.Registry.AnnualGeneralMeetingDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualGeneralMeetingDecision.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateAnnualMeetNotificationDocument(
    data: Cooperative.Registry.AnnualMeetingNotification.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.AnnualMeetingNotification.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async generateSovietDecisionOnAnnualMeetDocument(
    data: Cooperative.Registry.SovietDecisionOnAnnualMeeting.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    data.registry_id = Cooperative.Registry.SovietDecisionOnAnnualMeeting.registry_id;
    return await this.documentDomainService.generateDocument({ data, options });
  }

  async vote(data: VoteOnAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    return new MeetAggregate();
  }

  async restartMeet(data: RestartAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    return new MeetAggregate();
  }

  async closeMeet(data: CloseAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    return new MeetAggregate();
  }

  async createAnnualGeneralMeet(data: CreateAnnualGeneralMeetInputDomainInterface): Promise<MeetAggregate> {
    // const document = await this.documentDomainService.getDocumentByHash(data.document.hash);
    // if (!document) throw new BadRequestException('Документ не найден');
    // if (data.document.meta.registry_id != Cooperative.Registry.ProjectFreeDecision.registry_id)
    //   throw new BadRequestException('Неверный registry_id в переданном документе, ожидается registry_id == 101');
    // if (data.coopname != config.coopname)
    //   throw new BadRequestException('Указанное имя аккаунта кооператива не обслуживается здесь');
    // await this.meetBlockchainPort.createMeet({
    //   coopname: data.coopname,
    //   initiator: data.username,
    //   meta: data.meta,
    //   document: { ...data.document, meta: JSON.stringify(data.document.meta) },
    // });
    // return true;
    return new MeetAggregate();
  }
}
