import { Injectable, Inject } from '@nestjs/common';
import { CapitalContract } from 'cooptypes';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../interfaces/capital-blockchain.port';
import type { TransactResult } from '@wharfkit/session';
import type { CreateProgramPropertyDomainInput } from '../actions/create-program-property-domain-input.interface';
import type { CreateProjectPropertyDomainInput } from '../actions/create-project-property-domain-input.interface';

/**
 * Интерактор домена для управления имущественными взносами CAPITAL контракта
 * Обрабатывает действия связанные с внесением имущества в проекты и программы
 */
@Injectable()
export class PropertyManagementInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort
  ) {}

  /**
   * Создание проектного имущественного взноса в CAPITAL контракте
   */
  async createProjectProperty(data: CreateProjectPropertyDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CreateProjectProperty.ICreateProjectProperty = {
      coopname: data.coopname,
      username: data.username,
      project_hash: data.project_hash,
      property_hash: data.property_hash,
      property_amount: data.property_amount,
      property_description: data.property_description,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createProjectProperty(blockchainData);
  }

  /**
   * Создание программного имущественного взноса в CAPITAL контракте
   */
  async createProgramProperty(data: CreateProgramPropertyDomainInput): Promise<TransactResult> {
    // Преобразуем доменные данные в формат блокчейна
    const blockchainData: CapitalContract.Actions.CreateProgramProperty.ICreateProgramProperty = {
      coopname: data.coopname,
      username: data.username,
      property_hash: data.property_hash,
      property_amount: data.property_amount,
      property_description: data.property_description,
      statement: data.statement,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createProgramProperty(blockchainData);
  }
}
