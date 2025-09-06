import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ProjectWalletDomainEntity } from '../../../domain/entities/project-wallet.entity';
import type { IProjectWalletBlockchainData } from '../../../domain/interfaces/project-wallet-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { IBlockchainDeltaMapper } from '~/shared/interfaces/blockchain-sync.interface';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';
import type { CapitalContract } from 'cooptypes';

/**
 * Маппер для преобразования дельт блокчейна в данные проектного кошелька
 */
@Injectable()
export class ProjectWalletDeltaMapper
  implements IBlockchainDeltaMapper<IProjectWalletBlockchainData, ProjectWalletDomainEntity>
{
  constructor(private readonly logger: WinstonLoggerService, private readonly contractInfo: CapitalContractInfoService) {
    this.logger.setContext(ProjectWalletDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IProjectWalletBlockchainData | null {
    try {
      if (!this.isRelevantDelta(delta)) {
        return null;
      }

      // Дельта содержит данные в поле value
      const value = delta.value as CapitalContract.Tables.ProjectWallets.IProjectWallet;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Валидируем обязательные поля
      if (!this.validateBlockchainData(value)) {
        this.logger.warn(`Invalid blockchain data in delta: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      // Для ProjectWallets нет документов для парсинга
      return value;
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractEntityId(delta: IDelta): string {
    // В таблице projwallets primary_key является ID проектного кошелька
    return delta.primary_key.toString();
  }

  isRelevantDelta(delta: IDelta): boolean {
    const isRelevantContract = this.contractInfo.isContractSupported(delta.code);
    const isRelevantTable =
      delta.table === 'projwallets' || delta.table === 'projwallets*' || delta.table.includes('projwallets');

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
      'project_hash',
      'username',
      'shares',
      'last_membership_reward_per_share',
      'membership_available',
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
    return ['projwallets', 'projwallets*'];
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
