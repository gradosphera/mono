import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { VoteDomainEntity } from '../../../domain/entities/vote.entity';
import type { IVoteBlockchainData } from '../../../domain/interfaces/vote-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';

/**
 * Маппер для преобразования дельт блокчейна в данные голоса
 */
@Injectable()
export class VoteDeltaMapper implements IBlockchainDeltaMapper<IVoteBlockchainData, VoteDomainEntity> {
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(VoteDeltaMapper.name);
  }

  /**
   * Маппинг дельты в данные голоса из блокчейна
   */
  mapDeltaToBlockchainData(delta: IDelta): IVoteBlockchainData | null {
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

      return value as IVoteBlockchainData;
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Извлечение ID сущности из дельты
   */
  extractEntityId(delta: IDelta): string {
    // В таблице votes primary_key является ID голоса
    return delta.primary_key.toString();
  }

  /**
   * Проверка, относится ли дельта к голосам
   * Теперь поддерживает все версии таблиц и контрактов
   */
  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable = delta.table === 'votes' || delta.table === 'votes*' || delta.table.includes('votes');

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
    const requiredFields = ['id', 'project_hash', 'voter', 'recipient', 'amount', 'voted_at'];

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
    return ['votes', 'votes*'];
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
    const supportedTables = this.getSupportedTableNames();

    for (const contractName of supportedContracts) {
      for (const tableName of supportedTables) {
        patterns.push(`delta::${contractName}::${tableName}`);
      }
    }

    return patterns;
  }
}
