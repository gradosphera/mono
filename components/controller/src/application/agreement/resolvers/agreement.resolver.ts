import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { Throttle } from '@nestjs/throttler';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { AgreementService } from '../services/agreement.service';
import { AgreementDTO } from '../dto/agreement.dto';
import { AgreementFilterInput } from '../dto/agreement-filter.input';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { SendAgreementInputDTO } from '../dto/send-agreement-input.dto';
import { ConfirmAgreementInputDTO } from '../dto/confirm-agreement-input.dto';
import { DeclineAgreementInputDTO } from '../dto/decline-agreement-input.dto';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';

// Пагинированные результаты
const paginatedAgreementsResult = createPaginationResult(AgreementDTO, 'PaginatedAgreements');

@Resolver()
export class AgreementResolver {
  constructor(private readonly agreementService: AgreementService) {}

  // ============ ЗАПРОСЫ СОГЛАШЕНИЙ ============

  /**
   * Получение всех соглашений с фильтрацией
   */
  @Query(() => paginatedAgreementsResult, {
    name: 'agreements',
    description: 'Получение списка соглашений с фильтрацией и пагинацией',
  })
  async getAgreements(
    @Args('filter', { nullable: true }) filter?: AgreementFilterInput,
    @Args('options', { nullable: true }) options?: PaginationInputDTO
  ): Promise<PaginationResult<AgreementDTO>> {
    // Конвертируем параметры пагинации в доменный формат
    const domainOptions: PaginationInputDomainInterface | undefined = options
      ? {
          page: options.page,
          limit: options.limit,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        }
      : undefined;

    // Сервис возвращает полный пагинированный результат с DTO
    return await this.agreementService.getAgreements(filter, domainOptions);
  }

  // ============ МУТАЦИИ СОГЛАШЕНИЙ ============

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateWalletAgreement',
    description: 'Сгенерировать документ соглашения о целевой потребительской программе "Цифровой Кошелёк"',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateWalletAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generateWalletAgreement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generatePrivacyAgreement',
    description: 'Сгенерировать документ согласия с политикой конфиденциальности.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generatePrivacyAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generatePrivacyAgreement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateSignatureAgreement',
    description: 'Сгенерировать документ соглашения о порядка и правилах использования простой электронной подписи.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateSignatureAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generateSignatureAgreement(data, options);
  }

  @Mutation(() => GeneratedDocumentDTO, {
    name: 'generateUserAgreement',
    description: 'Сгенерировать документ пользовательского соглашения.',
  })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateUserAgreement(
    @Args('data', { type: () => GenerateDocumentInputDTO })
    data: GenerateDocumentInputDTO,
    @Args('options', { type: () => GenerateDocumentOptionsInputDTO, nullable: true })
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return this.agreementService.generateUserAgreement(data, options);
  }

  // ============ МУТАЦИИ ДЕЙСТВИЙ СОГЛАШЕНИЙ ============

  @Mutation(() => TransactionDTO, {
    name: 'sendAgreement',
    description: 'Отправить соглашение',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  async sendAgreement(
    @Args('data', { type: () => SendAgreementInputDTO }) data: SendAgreementInputDTO
  ): Promise<TransactionDTO> {
    return this.agreementService.sendAgreement(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'confirmAgreement',
    description: 'Подтвердить соглашение пайщика администратором',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async confirmAgreement(
    @Args('data', { type: () => ConfirmAgreementInputDTO }) data: ConfirmAgreementInputDTO
  ): Promise<TransactionDTO> {
    return this.agreementService.confirmAgreement(data);
  }

  @Mutation(() => TransactionDTO, {
    name: 'declineAgreement',
    description: 'Отклонить соглашение пайщика администратором',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async declineAgreement(
    @Args('data', { type: () => DeclineAgreementInputDTO }) data: DeclineAgreementInputDTO
  ): Promise<TransactionDTO> {
    return this.agreementService.declineAgreement(data);
  }
}
