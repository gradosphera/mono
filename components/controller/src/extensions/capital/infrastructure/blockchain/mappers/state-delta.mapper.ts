import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { StateDomainEntity } from '../../../domain/entities/state.entity';
import type { IStateBlockchainData } from '../../../domain/interfaces/state-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';

/**
 * Маппер для преобразования дельт блокчейна в данные состояния
 */
@Injectable()
export class StateDeltaMapper implements IBlockchainDeltaMapper<IStateBlockchainData, StateDomainEntity> {
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(StateDeltaMapper.name);
  }

  /**
   * Маппинг дельты в данные состояния из блокчейна
   */
  mapDeltaToBlockchainData(delta: IDelta): IStateBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      return value as IStateBlockchainData;
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Извлечение ID сущности из дельты
   */
  extractEntityId(delta: IDelta): string {
    // Для state сущности ID является coopname
    return delta.primary_key.toString();
  }

  /**
   * Проверка, относится ли дельта к состоянию
   * Теперь поддерживает все версии таблиц и контрактов
   */
  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable = delta.table === 'state'; // State имеет фиксированное имя таблицы

    return isRelevantContract && isRelevantTable;
  }

  /**
   * Валидация данных блокчейна
   */
  private validateBlockchainData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем обязательные поля
    const requiredFields = [
      'coopname',
      'global_available_invest_pool',
      'program_membership_funded',
      'program_membership_available',
      'program_membership_distributed',
      'program_membership_cumulative_reward_per_share',
      'config',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.logger.warn(`Missing required field '${field}' in blockchain data`);
        return false;
      }
    }

    return true;
  }

  /**
   * Получение всех поддерживаемых имен таблиц
   */
  getSupportedTableNames(): string[] {
    return ['state'];
  }

  /**
   * Получение всех поддерживаемых имен контрактов
   */
  getSupportedContractNames(): string[] {
    return this.contractInfo.getSupportedContractNames();
  }

  /**
   * Получение всех возможных паттернов событий для подписки
   * Возвращает массив паттернов типа "delta::contract::table"
   */
  getAllEventPatterns(): string[] {
    const patterns: string[] = [];
    const supportedContracts = this.contractInfo.getSupportedContractNames();

    for (const contractName of supportedContracts) {
      patterns.push(`delta::${contractName}::state`);
    }

    return patterns;
  }
}
