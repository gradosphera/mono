import { Injectable } from '@nestjs/common';
import { DistributionManagementInteractor } from '../../domain/interactors/distribution-management.interactor';
import type { FundProgramInputDTO } from '../dto/distribution_management/fund-program-input.dto';
import type { FundProjectInputDTO } from '../dto/distribution_management/fund-project-input.dto';
import type { RefreshProgramInputDTO } from '../dto/distribution_management/refresh-program-input.dto';
import type { RefreshProjectInputDTO } from '../dto/distribution_management/refresh-project-input.dto';
import type { TransactResult } from '@wharfkit/session';

/**
 * Сервис уровня приложения для управления распределением в CAPITAL
 * Обрабатывает запросы от DistributionManagementResolver
 */
@Injectable()
export class DistributionManagementService {
  constructor(private readonly distributionManagementInteractor: DistributionManagementInteractor) {}

  /**
   * Финансирование программы в CAPITAL контракте
   */
  async fundProgram(data: FundProgramInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.fundProgram(data);
  }

  /**
   * Финансирование проекта в CAPITAL контракте
   */
  async fundProject(data: FundProjectInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.fundProject(data);
  }

  /**
   * Обновление CRPS пайщика в программе CAPITAL контракта
   */
  async refreshProgram(data: RefreshProgramInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.refreshProgram(data);
  }

  /**
   * Обновление CRPS пайщика в проекте CAPITAL контракта
   */
  async refreshProject(data: RefreshProjectInputDTO): Promise<TransactResult> {
    return await this.distributionManagementInteractor.refreshProject(data);
  }
}
