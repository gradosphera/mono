import { Injectable, Inject } from '@nestjs/common';
import { GenerateDocumentOptionsInputDTO } from '~/application/document/dto/generate-document-options-input.dto';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { GenerateDocumentInputDTO } from '~/application/document/dto/generate-document-input.dto';
import { AgreementInteractor } from '../use-cases/agreement.interactor';
import {
  AgreementRepository,
  AGREEMENT_REPOSITORY,
  AgreementFilterInput,
} from '~/domain/agreement/repositories/agreement.repository';
import {
  UserAgreementRepository,
  USER_AGREEMENT_REPOSITORY,
} from '~/domain/wallet/repositories/user-agreement.repository';
import type { UserAgreementDomainEntity } from '~/domain/wallet/entities/user-agreement-domain.entity';
import type { IProgramAgreement } from '~/domain/wallet/interfaces/user-agreement-blockchain.interface';
import { AgreementStatus } from '~/domain/agreement/enums/agreement-status.enum';
import { AgreementDTO } from '../dto/agreement.dto';
import { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { PaginationResult } from '~/application/common/dto/pagination.dto';
import { DocumentAggregationService } from '~/domain/document/services/document-aggregation.service';
import { SendAgreementInputDTO } from '../dto/send-agreement-input.dto';
import { ConfirmAgreementInputDTO } from '../dto/confirm-agreement-input.dto';
import { DeclineAgreementInputDTO } from '../dto/decline-agreement-input.dto';
import { TransactionDTO } from '~/application/common/dto/transaction-result-response.dto';
import { config } from '~/config';

@Injectable()
export class AgreementService {
  constructor(
    private readonly agreementInteractor: AgreementInteractor,
    @Inject(AGREEMENT_REPOSITORY)
    private readonly agreementRepository: AgreementRepository,
    @Inject(USER_AGREEMENT_REPOSITORY)
    private readonly userAgreementRepository: UserAgreementRepository,
    private readonly documentAggregationService: DocumentAggregationService
  ) {}

  /**
   * Получить все соглашения с пагинацией и фильтрацией.
   *
   * Источник зависит от `program_id` (Эпик 2 / ADR-008):
   * - `program_id == 0` или не задан + явно непрограммный type → `soviet::agreements3`
   *   (репозиторий `agreement`).
   * - `program_id > 0` или фильтр без program_id → программные читаются из
   *   `wallet::users.programs[]` (репозиторий `user_agreement`) и разворачиваются
   *   в плоский ряд `AgreementDTO`.
   * - Без явного `program_id` оба источника объединяются в памяти.
   *
   * Программные DTO синтезируются: `id`/`document` отсутствуют (полный документ
   * лежит в action data, а не в state); `status=CONFIRMED` (запись в `users`
   * существует только для подписанных соглашений), `type='programmatic'`.
   */
  async getAgreements(
    filter?: AgreementFilterInput,
    options?: PaginationInputDomainInterface
  ): Promise<PaginationResult<AgreementDTO>> {
    const coopname = filter?.coopname ?? config.coopname;
    const onlyNonProgrammatic = filter?.program_id === 0;
    const onlyProgrammatic = typeof filter?.program_id === 'number' && filter.program_id > 0;

    const nonProgrammaticFilter = onlyProgrammatic
      ? null
      : onlyNonProgrammatic
        ? { ...filter, program_id: 0 }
        : filter;

    const nonProgItemsAll = nonProgrammaticFilter
      ? await this.fetchNonProgrammatic(nonProgrammaticFilter)
      : [];

    const progItemsAll = onlyNonProgrammatic
      ? []
      : await this.fetchProgrammatic({ ...filter, coopname });

    const merged = [...nonProgItemsAll, ...progItemsAll].sort(
      (a, b) => (b.updated_at?.getTime() ?? 0) - (a.updated_at?.getTime() ?? 0)
    );

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const totalCount = merged.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const offset = (page - 1) * limit;
    const items = merged.slice(offset, offset + limit);

    return { items, totalCount, totalPages, currentPage: page };
  }

  private async fetchNonProgrammatic(filter: AgreementFilterInput): Promise<AgreementDTO[]> {
    const result = await this.agreementRepository.findAllPaginated(filter, {
      page: 1,
      limit: 10_000,
      sortBy: undefined,
      sortOrder: 'DESC',
    });
    return await this.toDTOs(result.items);
  }

  private async fetchProgrammatic(filter: AgreementFilterInput & { coopname: string }): Promise<AgreementDTO[]> {
    let owners: UserAgreementDomainEntity[];

    if (filter.username) {
      const owner = await this.userAgreementRepository.findByUsername(filter.coopname, filter.username);
      owners = owner ? [owner] : [];
    } else if (typeof filter.program_id === 'number' && filter.program_id > 0) {
      owners = await this.userAgreementRepository.findByProgramId(filter.coopname, filter.program_id);
    } else {
      owners = await this.userAgreementRepository.findByCoopname(filter.coopname);
    }

    const flat: AgreementDTO[] = [];
    for (const owner of owners) {
      if (owner.present === false) continue;
      for (const program of owner.programs) {
        if (typeof filter.program_id === 'number' && filter.program_id > 0 && Number(program.program_id) !== filter.program_id) {
          continue;
        }
        flat.push(this.programAgreementToDTO(owner, program));
      }
    }
    return flat;
  }

  private programAgreementToDTO(owner: UserAgreementDomainEntity, program: IProgramAgreement): AgreementDTO {
    return {
      _id: owner._id,
      present: owner.present,
      block_num: owner.block_num,
      _created_at: owner._created_at,
      _updated_at: owner._updated_at,
      id: undefined,
      coopname: owner.coopname,
      username: owner.username,
      type: 'programmatic',
      program_id: Number(program.program_id),
      draft_id: program.draft_id ? Number(program.draft_id) : undefined,
      version: typeof program.version === 'number' ? program.version : Number(program.version),
      status: AgreementStatus.CONFIRMED,
      document: null,
      updated_at: program.signed_at ? new Date(program.signed_at) : undefined,
    };
  }

  public async generateWalletAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return await this.agreementInteractor.generateWalletAgreement(data, options);
  }

  public async generatePrivacyAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return await this.agreementInteractor.generatePrivacyAgreement(data, options);
  }

  public async generateSignatureAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return await this.agreementInteractor.generateSignatureAgreement(data, options);
  }

  public async generateUserAgreement(
    data: GenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    return await this.agreementInteractor.generateUserAgreement(data, options);
  }

  public async sendAgreement(data: SendAgreementInputDTO): Promise<TransactionDTO> {
    const result = await this.agreementInteractor.sendAgreement(data);
    return result as TransactionDTO;
  }

  public async confirmAgreement(data: ConfirmAgreementInputDTO): Promise<TransactionDTO> {
    const result = await this.agreementInteractor.confirmAgreement(data);
    return result as TransactionDTO;
  }

  public async declineAgreement(data: DeclineAgreementInputDTO): Promise<TransactionDTO> {
    const result = await this.agreementInteractor.declineAgreement(data);
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
