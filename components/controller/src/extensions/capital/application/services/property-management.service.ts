import { Injectable } from '@nestjs/common';
import { PropertyManagementInteractor } from '../../domain/interactors/property-management.interactor';
import type { CreateProgramPropertyInputDTO } from '../dto/property_management/create-program-property-input.dto';
import type { CreateProjectPropertyInputDTO } from '../dto/property_management/create-project-property-input.dto';
import type { TransactResult } from '@wharfkit/session';

/**
 * Сервис уровня приложения для управления имуществом CAPITAL
 * Обрабатывает запросы от PropertyManagementResolver
 */
@Injectable()
export class PropertyManagementService {
  constructor(private readonly propertyManagementInteractor: PropertyManagementInteractor) {}

  /**
   * Создание программного имущественного взноса в CAPITAL контракте
   */
  async createProgramProperty(data: CreateProgramPropertyInputDTO): Promise<TransactResult> {
    return await this.propertyManagementInteractor.createProgramProperty(data);
  }

  /**
   * Создание проектного имущественного взноса в CAPITAL контракте
   */
  async createProjectProperty(data: CreateProjectPropertyInputDTO): Promise<TransactResult> {
    return await this.propertyManagementInteractor.createProjectProperty(data);
  }
}
