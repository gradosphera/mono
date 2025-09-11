import { Injectable } from '@nestjs/common';
import { DebtManagementInteractor } from '../use-cases/debt-management.interactor';
import type { CreateDebtInputDTO } from '../dto/debt_management/create-debt-input.dto';
import type { TransactResult } from '@wharfkit/session';
import { DebtOutputDTO } from '../dto/debt_management/debt.dto';
import { DebtFilterInputDTO } from '../dto/debt_management/debt-filter.input';
import { PaginationInputDTO, PaginationResult } from '~/application/common/dto/pagination.dto';
import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

/**
 * Сервис уровня приложения для управления долгами CAPITAL
 * Обрабатывает запросы от DebtManagementResolver
 */
@Injectable()
export class DebtManagementService {
  constructor(private readonly debtManagementInteractor: DebtManagementInteractor) {}

  /**
   * Создание долга в CAPITAL контракте
   */
  async createDebt(data: CreateDebtInputDTO): Promise<TransactResult> {
    return await this.debtManagementInteractor.createDebt(data);
  }

  // ============ МЕТОДЫ ЧТЕНИЯ ДАННЫХ ============

  /**
   * Получение всех долгов с фильтрацией
   */
  async getDebts(filter?: DebtFilterInputDTO, options?: PaginationInputDTO): Promise<PaginationResult<DebtOutputDTO>> {
    // Конвертируем параметры пагинации в доменные
    const domainOptions: PaginationInputDomainInterface | undefined = options;

    // Получаем результат с пагинацией из домена
    const result = await this.debtManagementInteractor.getDebts(filter, domainOptions);

    // Конвертируем результат в DTO
    return {
      items: result.items as DebtOutputDTO[],
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Получение долга по ID
   */
  async getDebtById(_id: string): Promise<DebtOutputDTO | null> {
    const debt = await this.debtManagementInteractor.getDebtById(_id);
    return debt as DebtOutputDTO | null;
  }
}
