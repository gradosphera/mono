import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ProjectPropertyDomainEntity } from '../../../domain/entities/project-property.entity';
import type { IProjectPropertyBlockchainData } from '../../../domain/interfaces/project-property-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные проектного имущественного взноса
 */
@Injectable()
export class ProjectPropertyDeltaMapper
  implements IBlockchainDeltaMapper<IProjectPropertyBlockchainData, ProjectPropertyDomainEntity>
{
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(ProjectPropertyDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IProjectPropertyBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.ProjectProperties.IProperty;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Для ProjectProperties нет документов для парсинга
      return value;
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractEntityId(delta: IDelta): string {
    // В таблице pjproperties primary_key является ID проектного имущественного взноса
    return delta.primary_key.toString();
  }

  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable =
      delta.table === 'pjproperties' || delta.table === 'pjproperties*' || delta.table.includes('pjproperties');

    return isRelevantContract && isRelevantTable;
  }

  private validateBlockchainData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Проверяем обязательные поля
    const requiredFields = [
      'id',
      'coopname',
      'username',
      'status',
      'project_hash',
      'property_hash',
      'property_amount',
      'property_description',
      'created_at',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        this.logger.warn(`Missing required field '${field}' in blockchain data`);
        return false;
      }
    }

    return true;
  }

  getSupportedTableNames(): string[] {
    return ['pjproperties', 'pjproperties*'];
  }

  getSupportedContractNames(): string[] {
    return this.contractInfo.getSupportedContractNames();
  }

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
