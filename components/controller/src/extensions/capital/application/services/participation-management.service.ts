import { Injectable } from '@nestjs/common';
import { ParticipationManagementInteractor } from '../../domain/interactors/participation-management.interactor';
import type { ImportContributorInputDTO } from '../dto/participation_management/import-contributor-input.dto';
import type { RegisterContributorInputDTO } from '../dto/participation_management/register-contributor-input.dto';
import type { MakeClearanceInputDTO } from '../dto/participation_management/make-clearance-input.dto';
import type { TransactResult } from '@wharfkit/session';
import { ContributorOutputDTO } from '../dto/participation_management/contributor.dto';
import { ContributorFilterInputDTO } from '../dto/participation_management/contributor-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Сервис уровня приложения для управления участием в CAPITAL
 * Обрабатывает запросы от ParticipationManagementResolver
 */
@Injectable()
export class ParticipationManagementService {
  constructor(private readonly participationManagementInteractor: ParticipationManagementInteractor) {}

  /**
   * Импорт вкладчика в CAPITAL контракт
   */
  async importContributor(data: ImportContributorInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.importContributor(data);
  }

  /**
   * Регистрация вкладчика в CAPITAL контракте
   */
  async registerContributor(data: RegisterContributorInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.registerContributor(data);
  }

  /**
   * Подписание приложения в CAPITAL контракте
   */
  async makeClearance(data: MakeClearanceInputDTO): Promise<TransactResult> {
    return await this.participationManagementInteractor.makeClearance(data);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех вкладчиков с фильтрацией
   */
  async getContributors(
    filter?: ContributorFilterInputDTO,
    options?: PaginationInputDTO
  ): Promise<PaginationResult<ContributorOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.participationManagementInteractor.getContributors(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as ContributorOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение вкладчика по ID
   */
  async getContributorById(_id: string): Promise<ContributorOutputDTO | null> {
    const contributor = await this.participationManagementInteractor.getContributorById(_id);
    return contributor as ContributorOutputDTO | null;
  }
}
