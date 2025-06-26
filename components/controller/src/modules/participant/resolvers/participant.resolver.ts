import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { ParticipantService } from '../services/participant.service';
import { ParticipantApplicationGenerateDocumentInputDTO } from '../../document/documents-dto/participant-application-document.dto';
import { ParticipantApplicationDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/participant-application-decision-document.dto';
import { AccountDTO } from '~/modules/account/dto/account.dto';
import { AddParticipantInputDTO } from '../dto/add-participant-input.dto';
import { RegisterParticipantInputDTO } from '../dto/register-participant-input.dto';
import { CreateInitialPaymentInputDTO } from '../../gateway/dto/create-initial-payment-input.dto';
import { GatewayPaymentDTO } from '../../gateway/dto/gateway-payment.dto';

@Resolver()
export class ParticipantResolver {
  constructor(private readonly participantService: ParticipantService) {}

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateParticipantApplication',
    description: 'Сгенерировать документ заявления о вступлении в кооператив.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateParticipantApplication(
    @Args('data', { type: () => ParticipantApplicationGenerateDocumentInputDTO })
    data: ParticipantApplicationGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.participantService.generateParticipantApplication(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateParticipantApplicationDecision',
    description: 'Сгенерировать документ протокол решения собрания совета',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateParticipantApplicationDecision(
    @Args('data', { type: () => ParticipantApplicationDecisionGenerateDocumentInputDTO })
    data: ParticipantApplicationDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.participantService.generateParticipantApplicationDecision(data, options);
  }

  @Mutation(() => AccountDTO, {
    name: 'addParticipant',
    description:
      'Добавить активного пайщика, который вступил в кооператив, не используя платформу (заполнив заявление собственноручно, оплатив вступительный и минимальный паевый взносы, и получив протокол решения совета)',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async addParticipant(
    @Args('data', { type: () => AddParticipantInputDTO })
    data: AddParticipantInputDTO
  ): Promise<AccountDTO> {
    return this.participantService.addParticipant(data);
  }

  @Mutation(() => AccountDTO, {
    name: 'registerParticipant',
    description:
      'Зарегистрировать заявление и подписанные положения, подготовив пакет документов к отправке в совет на голосование после поступления оплаты.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async registerParticipant(
    @Args('data', { type: () => RegisterParticipantInputDTO })
    data: RegisterParticipantInputDTO
  ): Promise<AccountDTO> {
    return this.participantService.registerParticipant(data);
  }

  @Mutation(() => GatewayPaymentDTO, {
    name: 'createInitialPayment',
    description:
      'Создание объекта регистрационного платежа производится мутацией createInitialPayment. Выполнение мутации возвращает идентификатор платежа и данные для его совершения в зависимости от выбранного платежного провайдера.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createInitialPayment(
    @Args('data', { type: () => CreateInitialPaymentInputDTO }) data: CreateInitialPaymentInputDTO
  ): Promise<GatewayPaymentDTO> {
    return await this.participantService.createInitialPayment(data);
  }
}
