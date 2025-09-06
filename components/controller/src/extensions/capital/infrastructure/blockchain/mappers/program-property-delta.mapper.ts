import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ProgramPropertyDomainEntity } from '../../../domain/entities/program-property.entity';
import type { IProgramPropertyBlockchainData } from '../../../domain/interfaces/program-property-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные программного имущественного взноса
 */
@Injectable()
export class ProgramPropertyDeltaMapper
  implements IBlockchainDeltaMapper<IProgramPropertyBlockchainData, ProgramPropertyDomainEntity>
{
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(ProgramPropertyDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IProgramPropertyBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.ProgramProperties.IProgramProperty;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // 🔥 ВАЖНО: Парсим документы ПЕРЕД возвратом
      const statement = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.statement);
      const authorization = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.authorization);
      const act = DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.act);

      // Парсим документы
      return { ...value, statement, authorization, act };
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractEntityId(delta: IDelta): string {
    // В таблице pgproperties primary_key является ID программного имущественного взноса
    return delta.primary_key.toString();
  }

  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable =
      delta.table === 'pgproperties' || delta.table === 'pgproperties*' || delta.table.includes('pgproperties');

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
      'property_hash',
      'property_amount',
      'property_description',
      'statement',
      'authorization',
      'act',
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
    return ['pgproperties', 'pgproperties*'];
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
