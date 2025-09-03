import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { WalletService } from '../services/wallet.service';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { ReturnByMoneyGenerateDocumentInputDTO } from '~/application/document/documents-dto/return-by-money-statement.dto';
import { ReturnByMoneyDecisionGenerateDocumentInputDTO } from '~/application/document/documents-dto/return-by-money-decision.dto';
import { CreateWithdrawInputDTO } from '../dto/create-withdraw-input.dto';
import { CreateWithdrawResponseDTO } from '../dto/create-withdraw-response.dto';
import { CreateDepositPaymentInputDTO } from '../../gateway/dto/create-deposit-payment-input.dto';
import { GatewayPaymentDTO } from '../../gateway/dto/gateway-payment.dto';

/**
 * GraphQL резолвер для wallet
 * Обеспечивает API для управления паевыми взносами, их возвратами, и генерацией документов
 */
@Resolver()
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Mutation: Генерация документа заявления на возврат паевого взноса (900)
   */
  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateReturnByMoneyStatementDocument',
    description: 'Сгенерировать документ заявления на возврат паевого взноса',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByMoneyStatementDocument(
    @Args('data', { type: () => ReturnByMoneyGenerateDocumentInputDTO })
    data: ReturnByMoneyGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.walletService.generateReturnByMoneyStatementDocument(data, options);
  }

  /**
   * Mutation: Генерация документа решения совета о возврате паевого взноса (901)
   */
  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateReturnByMoneyDecisionDocument',
    description: 'Сгенерировать документ решения совета о возврате паевого взноса',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateReturnByMoneyDecisionDocument(
    @Args('data', { type: () => ReturnByMoneyDecisionGenerateDocumentInputDTO })
    data: ReturnByMoneyDecisionGenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.walletService.generateReturnByMoneyDecisionDocument(data, options);
  }

  /**
   * Mutation: Создание заявки на вывод средств
   */
  @Mutation(() => CreateWithdrawResponseDTO, {
    name: 'createWithdraw',
    description: 'Создать заявку на вывод средств',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createWithdraw(@Args('input') input: CreateWithdrawInputDTO): Promise<CreateWithdrawResponseDTO> {
    return this.walletService.createWithdraw(input);
  }

  /**
   * Mutation: Создать депозитный платеж
   */
  @Mutation(() => GatewayPaymentDTO, {
    name: 'createDepositPayment',
    description:
      'Создание объекта паевого платежа производится мутацией createDepositPayment. Выполнение мутации возвращает идентификатор платежа и данные для его совершения в зависимости от выбранного платежного провайдера.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async createDepositPayment(
    @Args('data', { type: () => CreateDepositPaymentInputDTO }) data: CreateDepositPaymentInputDTO
  ): Promise<GatewayPaymentDTO> {
    return await this.walletService.createDepositPayment(data);
  }
}
