import { Injectable, Inject } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { AgreementDomainInteractor } from '~/domain/agreement/interactors/agreement-domain.interactor';
import {
  AgreementRepository,
  AGREEMENT_REPOSITORY,
  AgreementFilterInput,
} from '~/domain/agreement/repositories/agreement.repository';
import { AgreementDTO } from '../dto/agreement.dto';
import { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { PaginationResult } from '~/application/common/dto/pagination.dto';
import { DocumentAggregationService } from '~/domain/document/services/document-aggregation.service';
import { SendAgreementInputDTO } from '../dto/send-agreement-input.dto';
import { ConfirmAgreementInputDTO } from '../dto/confirm-agreement-input.dto';
import { DeclineAgreementInputDTO } from '../dto/decline-agreement-input.dto';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';

@Injectable()
export class AgreementService {
  constructor(
    private readonly agreementDomainInteractor: AgreementDomainInteractor,
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: AgreementRepository,
    private readonly documentAggregationService: DocumentAggregationService
  ) {}

  /**
   * Получить все соглашения с пагинацией и фильтрацией
   */
  async getAgreements(
    filter?: AgreementFilterInput,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResult<AgreementDTO>> {
    // Получаем пагинированный результат из репозитория
    const result = await this.agreementRepository.findAllPaginated(filter, options);

    // Преобразуем в DTO
    const items = await this.toDTOs(result.items);

    // Возвращаем полный пагинированный результат
    return {
      items,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  public async generateWalletAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generateWalletAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }

  public async generatePrivacyAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generatePrivacyAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }

  public async generateSignatureAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generateSignatureAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }

  public async generateUserAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.agreementDomainInteractor.generateUserAgreement(data, options);
    return document as GeneratedDocumentDTO;
  }

  public async sendAgreement(data: SendAgreementInputDTO): Promise<TransactionDTO> {
    const result = await this.agreementDomainInteractor.sendAgreement(data);
    return result as TransactionDTO;
  }

  public async confirmAgreement(data: ConfirmAgreementInputDTO): Promise<TransactionDTO> {
    const result = await this.agreementDomainInteractor.confirmAgreement(data);
    return result as TransactionDTO;
  }

  public async declineAgreement(data: DeclineAgreementInputDTO): Promise<TransactionDTO> {
    const result = await this.agreementDomainInteractor.declineAgreement(data);
    return result as TransactionDTO;
  }

  /**
   * Преобразовать доменную сущность в DTO
   */
  private async toDTO(
    entity: import('~/domain/agreement/entities/agreement.entity').AgreementDomainEntity
  ): Promise<AgreementDTO> {
    // Преобразуем документ в агрегат
    const document = entity.document ? await this.documentAggregationService.buildDocumentAggregate(entity.document) : null;

    return {
      _id: entity._id,
      present: entity.present,
      block_num: entity.block_num,
      _created_at: entity._created_at,
      _updated_at: entity._updated_at,
      id: entity.id,
      coopname: entity.coopname,
      username: entity.username,
      type: entity.type,
      program_id: entity.program_id ? parseInt(entity.program_id.toString(), 10) : undefined,
      draft_id: entity.draft_id ? parseInt(entity.draft_id.toString(), 10) : undefined,
      version: entity.version ? parseInt(entity.version.toString(), 10) : undefined,
      status: entity.status,
      document,
      updated_at: entity.updated_at ? new Date(entity.updated_at.toString()) : undefined,
    };
  }

  /**
   * Преобразовать массив доменных сущностей в массив DTO
   */
  private async toDTOs(
    entities: import('~/domain/agreement/entities/agreement.entity').AgreementDomainEntity[]
  ): Promise<AgreementDTO[]> {
    return await Promise.all(entities.map((entity) => this.toDTO(entity)));
  }
}
