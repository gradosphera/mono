import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ContributorDomainEntity } from '../../../domain/entities/contributor.entity';
import type { IContributorBlockchainData } from '../../../domain/interfaces/contributor-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные вкладчика
 */
@Injectable()
export class ContributorDeltaMapper implements IBlockchainDeltaMapper<IContributorBlockchainData, ContributorDomainEntity> {
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(ContributorDeltaMapper.name);
  }

  /**
   * Маппинг дельты в данные вкладчика из блокчейна
   */
  mapDeltaToBlockchainData(delta: IDelta): IContributorBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.Contributors.IContributor;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Парсим документ
      value.contract = DomainToBlockchainUtils.convertChainDocumentToSignedDocument2(value.contract);

      return value as any as IContributorBlockchainData;
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Извлечение ID сущности из дельты
   */
  extractEntityId(delta: IDelta): string {
    // В таблице contributors primary_key является ID вкладчика
    return delta.primary_key.toString();
  }

  /**
   * Проверка, относится ли дельта к вкладчикам
   * Теперь поддерживает все версии таблиц и контрактов
   */
  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable = delta.table.includes('contributor'); // Более гибкая проверка для разных версий таблицы

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
    const requiredFields = ['id', 'coopname', 'username', 'contributor_hash', 'status'];

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
    return this.contractInfo.getSupportedTableNames().filter((name) => name.includes('contributor'));
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

  /**
   * Получение паттерна для подписки на все события вкладчиков
   * Использует wildcard паттерн для гибкой подписки
   */
  getSubscriptionPattern(): string {
    // Паттерн для подписки на все события, содержащие "contributor" в названии таблицы
    return 'delta::*::contributor*';
  }
}
