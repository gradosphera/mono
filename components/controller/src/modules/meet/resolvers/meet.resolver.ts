import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { CreateAnnualGeneralMeetInputDTO } from '../dto/create-meet-agenda-input.dto';
import { MeetService } from '../services/meet.service';
import { MeetAggregateDTO } from '../dto/meet-aggregate.dto';
import { AnnualGeneralMeetingAgendaGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-agenda-document.dto';
import { VoteOnAnnualGeneralMeetInputDTO } from '../dto/vote-on-annual-general-meet-input.dto';
import { RestartAnnualGeneralMeetInputDTO } from '../dto/restart-annual-general-meet-input.dto';
import { GetMeetInputDTO } from '../dto/get-meet-input.dto';
import { GetMeetsInputDTO } from '../dto/get-meets-input.dto';
import { SignBySecretaryOnAnnualGeneralMeetInputDTO } from '../dto/sign-by-secretary-on-annual-general-meet-input.dto';
import { SignByPresiderOnAnnualGeneralMeetInputDTO } from '../dto/sign-by-presider-on-annual-general-meet-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { AnnualGeneralMeetingVotingBallotGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-voting-ballot-document.dto';
import { AnnualGeneralMeetingSovietDecisionGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-soviet-decision-document.dto';
import { AnnualGeneralMeetingDecisionGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-decision-document.dto';
import { AnnualGeneralMeetingNotificationGenerateDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-notification-document.dto';
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { NotifyOnAnnualGeneralMeetInputDTO } from '../dto/notify-on-annual-general-meet-input.dto';

@Resolver()
export class MeetResolver {
  constructor(private readonly meetService: MeetService) {}

  @Query(() => MeetAggregateDTO, {
    name: 'getMeet',
    description: 'Получить данные собрания по хешу',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async getMeet(
    @Args('data', { type: () => GetMeetInputDTO })
    data: GetMeetInputDTO,
    @CurrentUser() currentUser: MonoAccountDomainInterface
  ): Promise<MeetAggregateDTO> {
    return this.meetService.getMeet(data, currentUser?.username ?? null);
  }

  @Query(() => [MeetAggregateDTO], {
    name: 'getMeets',
    description: 'Получить список всех собраний кооператива',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async getMeets(
    @Args('data', { type: () => GetMeetsInputDTO }) data: GetMeetsInputDTO,
    @CurrentUser() currentUser: MonoAccountDomainInterface
  ): Promise<MeetAggregateDTO[]> {
    return this.meetService.getMeets(data, currentUser?.username ?? null);
  }

  @Mutation(() => MeetAggregateDTO, {
    name: 'createAnnualGeneralMeet',
    description: 'Сгенерировать документ предложения повестки очередного общего собрания пайщиков',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createAnnualGeneralMeet(
    @Args('data', { type: () => CreateAnnualGeneralMeetInputDTO })
    data: CreateAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    return this.meetService.createAnnualGeneralMeet(data);
  }

  @Mutation(() => MeetAggregateDTO, {
    name: 'voteOnAnnualGeneralMeet',
    description: 'Голосование на общем собрании пайщиков',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['member'])
  async voteOnAnnualGeneralMeet(
    @Args('data', { type: () => VoteOnAnnualGeneralMeetInputDTO })
    data: VoteOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    return this.meetService.vote(data);
  }

  @Mutation(() => MeetAggregateDTO, {
    name: 'restartAnnualGeneralMeet',
    description: 'Перезапуск общего собрания пайщиков',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async restartAnnualGeneralMeet(
    @Args('data', { type: () => RestartAnnualGeneralMeetInputDTO })
    data: RestartAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    return this.meetService.restartMeet(data);
  }

  @Mutation(() => MeetAggregateDTO, {
    name: 'signBySecretaryOnAnnualGeneralMeet',
    description: 'Подписание решения секретарём на общем собрании пайщиков',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async signBySecretaryOnAnnualGeneralMeet(
    @Args('data', { type: () => SignBySecretaryOnAnnualGeneralMeetInputDTO })
    data: SignBySecretaryOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    return this.meetService.signBySecretaryOnAnnualGeneralMeet(data);
  }

  @Mutation(() => MeetAggregateDTO, {
    name: 'signByPresiderOnAnnualGeneralMeet',
    description: 'Подписание решения председателем на общем собрании пайщиков',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async signByPresiderOnAnnualGeneralMeet(
    @Args('data', { type: () => SignByPresiderOnAnnualGeneralMeetInputDTO })
    data: SignByPresiderOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    return this.meetService.signByPresiderOnAnnualGeneralMeet(data);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateAnnualGeneralMeetDecisionDocument',
    description: 'Сгенерировать документ решения общего собрания пайщиков',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAnnualGeneralMeetDecisionDocument(
    @Args('data', { type: () => AnnualGeneralMeetingDecisionGenerateDocumentInputDTO })
    data: AnnualGeneralMeetingDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.meetService.generateAnnualGeneralMeetDecisionDocument(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateAnnualGeneralMeetNotificationDocument',
    description: 'Сгенерировать документ уведомления о проведении общего собрания пайщиков',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAnnualGeneralMeetNotificationDocument(
    @Args('data', { type: () => AnnualGeneralMeetingNotificationGenerateDocumentInputDTO })
    data: AnnualGeneralMeetingNotificationGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.meetService.generateAnnualGeneralMeetNotificationDocument(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateSovietDecisionOnAnnualMeetDocument',
    description: 'Сгенерировать документ решения Совета по проведению общего собрания пайщиков',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateSovietDecisionOnAnnualMeetDocument(
    @Args('data', { type: () => AnnualGeneralMeetingSovietDecisionGenerateDocumentInputDTO })
    data: AnnualGeneralMeetingSovietDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.meetService.generateSovietDecisionOnAnnualMeetDocument(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateBallotForAnnualGeneralMeetDocument',
    description: 'Сгенерировать бюллетень для голосования на общем собрании пайщиков',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['member'])
  async generateBallotForAnnualGeneralMeetDocument(
    @Args('data', { type: () => AnnualGeneralMeetingVotingBallotGenerateDocumentInputDTO })
    data: AnnualGeneralMeetingVotingBallotGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.meetService.generateBallotForAnnualGeneralMeet(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateAnnualGeneralMeetAgendaDocument',
    description: 'Сгенерировать предложение повестки общего собрания пайщиков',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAnnualGeneralMeetAgendaDocument(
    @Args('data', { type: () => AnnualGeneralMeetingAgendaGenerateDocumentInputDTO })
    data: AnnualGeneralMeetingAgendaGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.meetService.generateAnnualGeneralMeetAgendaDocument(data, options);
  }

  @Mutation(() => MeetAggregateDTO, {
    name: 'notifyOnAnnualGeneralMeet',
    description: 'Уведомление о проведении общего собрания пайщиков',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async notifyOnAnnualGeneralMeet(
    @Args('data', { type: () => NotifyOnAnnualGeneralMeetInputDTO })
    data: NotifyOnAnnualGeneralMeetInputDTO
  ): Promise<MeetAggregateDTO> {
    return this.meetService.notifyOnAnnualGeneralMeet(data);
  }
}
