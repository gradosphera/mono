import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { CooplaceService } from '../services/cooplace.service';
import { AssetContributionStatementGenerateDocumentInputDTO } from '../../document/documents-dto/asset-contribution-statement-document.dto';
import { AssetContributionDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/asset-contribution-decision-document.dto';
import { AssetContributionActGenerateDocumentInputDTO } from '../../document/documents-dto/asset-contribution-act-document.dto';
import { ReturnByAssetStatementGenerateDocumentInputDTO } from '../../document/documents-dto/return-by-asset-statement-document.dto';
import { ReturnByAssetDecisionGenerateDocumentInputDTO } from '../../document/documents-dto/return-by-asset-decision-document.dto';
import { ReturnByAssetActGenerateDocumentInputDTO } from '../../document/documents-dto/return-by-asset-act-document.dto';
import { AcceptChildOrderInputDTO } from '../dto/accept-child-order-input.dto';
import { TransactionDTO } from '~/modules/common/dto/transaction-result-response.dto';
import { CancelRequestInputDTO } from '../dto/cancel-request-input.dto';
import { CompleteRequestInputDTO } from '../dto/complete-request-input.dto';
import { ConfirmReceiveOnRequestInputDTO } from '../dto/confirm-receive-on-request.dto';
import { ConfirmSupplyOnRequestInputDTO } from '../dto/confirm-supply-on-request.dto';
import { CreateChildOrderInputDTO } from '../dto/create-child-order-input.dto';
import { CreateParentOfferInputDTO } from '../dto/create-parent-offer-input.dto';
import { DeclineRequestInputDTO } from '../dto/decline-request-input.dto';
import { DeliverOnRequestInputDTO } from '../dto/deliver-on-request-input.dto';
import { DisputeOnRequestInputDTO } from '../dto/dispute-on-request-input.dto';
import { ModerateRequestInputDTO } from '../dto/moderate-request-input.dto';
import { ProhibitRequestInputDTO } from '../dto/prohibit-request-input.dto';
import { PublishRequestInputDTO } from '../dto/publish-request-input.dto';
import { ReceiveOnRequestInputDTO } from '../dto/receive-on-request-input.dto';
import { SupplyOnRequestInputDTO } from '../dto/supply-on-request-input.dto';
import { UnpublishRequestInputDTO } from '../dto/unpublish-request-input.dto';
import { UpdateRequestInputDTO } from '../dto/update-request-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';

@Resolver()
export class CooplaceResolver {
  constructor(private readonly cooplaceService: CooplaceService) {}

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateAssetContributionStatement',
    description: 'Сгенерировать документ заявления о вступлении в кооператив.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAssetContributionStatement(
    @Args('data', { type: () => AssetContributionStatementGenerateDocumentInputDTO })
    data: AssetContributionStatementGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.cooplaceService.generateAssetContributionStatement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateAssetContributionDecision',
    description: 'Сгенерировать документ решения о вступлении в кооператив.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAssetContributionDecision(
    @Args('data', { type: () => AssetContributionDecisionGenerateDocumentInputDTO })
    data: AssetContributionDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.cooplaceService.generateAssetContributionDecision(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateAssetContributionAct',
    description: 'Сгенерировать документ акта приема-передачи.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateAssetContributionAct(
    @Args('data', { type: () => AssetContributionActGenerateDocumentInputDTO })
    data: AssetContributionActGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.cooplaceService.generateAssetContributionAct(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateReturnByAssetStatement',
    description: 'Сгенерировать документ заявления о возврате имущества.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByAssetStatement(
    @Args('data', { type: () => ReturnByAssetStatementGenerateDocumentInputDTO })
    data: ReturnByAssetStatementGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.cooplaceService.generateReturnByAssetStatement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateReturnByAssetDecision',
    description: 'Сгенерировать документ решения о возврате имущества.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByAssetDecision(
    @Args('data', { type: () => ReturnByAssetDecisionGenerateDocumentInputDTO })
    data: ReturnByAssetDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.cooplaceService.generateReturnByAssetDecision(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateReturnByAssetAct',
    description: 'Сгенерировать документ акта возврата имущества.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByAssetAct(
    @Args('data', { type: () => ReturnByAssetActGenerateDocumentInputDTO })
    data: ReturnByAssetActGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.cooplaceService.generateReturnByAssetAct(data, options);
  }

  @Mutation(() => TransactionDTO, {
    name: 'acceptChildOrder',
    description: 'Подтвердить поставку имущества на заявку',
  })
  async acceptChildOrder(
    @Args('data', { type: () => AcceptChildOrderInputDTO }) data: AcceptChildOrderInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.acceptChildOrder(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'cancelRequest',
    description: 'Отменить заявку',
  })
  async cancelRequest(
    @Args('data', { type: () => CancelRequestInputDTO }) data: CancelRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.cancelRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'completeRequest',
    description: 'Завершить заявку по истечению гарантийного срока',
  })
  async completeRequest(
    @Args('data', { type: () => CompleteRequestInputDTO }) data: CompleteRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.completeRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'confirmReceiveOnRequest',
    description: 'Подтвердить получение имущества Уполномоченным лицом от Заказчика по новации и акту приёмки-передачи',
  })
  async confirmReceiveOnRequest(
    @Args('data', { type: () => ConfirmReceiveOnRequestInputDTO }) data: ConfirmReceiveOnRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.confirmReceiveOnRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'confirmSupplyOnRequest',
    description: 'Подтвердить поставку имущества Поставщиком по заявке Заказчика и акту приёма-передачи',
  })
  async confirmSupplyOnRequest(
    @Args('data', { type: () => ConfirmSupplyOnRequestInputDTO }) data: ConfirmSupplyOnRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.confirmSupplyOnRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'createChildOrder',
    description: 'Создать заявку на поставку имущества по предложению Поставщика',
  })
  async createChildOrder(
    @Args('data', { type: () => CreateChildOrderInputDTO }) data: CreateChildOrderInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.createChildOrder(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'createParentOffer',
    description: 'Создать предложение на поставку имущества',
  })
  async createParentOffer(
    @Args('data', { type: () => CreateParentOfferInputDTO }) data: CreateParentOfferInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.createParentOffer(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'declineRequest',
    description: 'Отклонить заявку',
  })
  async declineRequest(
    @Args('data', { type: () => DeclineRequestInputDTO }) data: DeclineRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.declineRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'deliverOnRequest',
    description: 'Подтвердить доставку имущества Заказчику по заявке',
  })
  async deliverOnRequest(
    @Args('data', { type: () => DeliverOnRequestInputDTO }) data: DeliverOnRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.deliverOnRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'disputeOnRequest',
    description: 'Открыть спор по заявке',
  })
  async disputeOnRequest(
    @Args('data', { type: () => DisputeOnRequestInputDTO }) data: DisputeOnRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.disputeOnRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'moderateRequest',
    description: 'Модерировать заявку',
  })
  async moderateRequest(
    @Args('data', { type: () => ModerateRequestInputDTO }) data: ModerateRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.moderateRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'prohibitRequest',
    description: 'Отклонить модерацию по заявке',
  })
  async prohibitRequest(
    @Args('data', { type: () => ProhibitRequestInputDTO }) data: ProhibitRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.prohibitRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'publishRequest',
    description: 'Опубликовать заявку',
  })
  async publishRequest(
    @Args('data', { type: () => PublishRequestInputDTO }) data: PublishRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.publishRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'receiveOnRequest',
    description: 'Подтвердить получение имущества Уполномоченным лицом от Заказчика по акту приёмки-передачи',
  })
  async receiveOnRequest(
    @Args('data', { type: () => ReceiveOnRequestInputDTO }) data: ReceiveOnRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.receiveOnRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'supplyOnRequest',
    description: 'Подтвердить поставку имущества Поставщиком по заявке Заказчика и акту приёма-передачи',
  })
  async supplyOnRequest(
    @Args('data', { type: () => SupplyOnRequestInputDTO }) data: SupplyOnRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.supplyOnRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'unpublishRequest',
    description: 'Снять с публикации заявку',
  })
  async unpublishRequest(
    @Args('data', { type: () => UnpublishRequestInputDTO }) data: UnpublishRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.unpublishRequest(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'updateRequest',
    description: 'Обновить заявку',
  })
  async updateRequest(
    @Args('data', { type: () => UpdateRequestInputDTO }) data: UpdateRequestInputDTO
  ): Promise<TransactionDTO> {
    return this.cooplaceService.updateRequest(data);
  }
}
