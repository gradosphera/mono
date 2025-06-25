import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { WalletService } from '../services/wallet.service';
import { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { ReturnByMoneyGenerateDocumentInputDTO } from '~/modules/document/documents-dto/return-by-money-statement.dto';
import { ReturnByMoneyDecisionGenerateDocumentInputDTO } from '~/modules/document/documents-dto/return-by-money-decision.dto';
import { CreateWithdrawInputDTO } from '../dto/create-withdraw-input.dto';
import { CreateWithdrawResponseDTO } from '../dto/create-withdraw-response.dto';

/**
 * GraphQL резолвер для wallet
 * Обеспечивает API для управления выводом средств и генерацией документов
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
}
