import { Injectable } from '@nestjs/common';
import type { IDelta } from '~/types/common';
import { ExpenseProposalDomainEntity } from '../../../domain/entities/expense-proposal.entity';
import type { IExpenseProposalBlockchainData } from '../../../domain/interfaces/expense-proposal-blockchain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { ExpenseContractInfoService } from '../../services/expense-contract-info.service';
import { AbstractBlockchainDeltaMapper } from '~/shared/abstract-blockchain-delta.mapper';
import { DomainToBlockchainUtils } from '~/shared/utils/domain-to-blockchain.utils';

/**
 * Маппер дельт таблицы `expense::proposals` в блокчейн-данные расхода.
 *
 * NB: типизация `delta.value` сейчас идёт через локальный интерфейс — после
 * регистрации контракта `expense` в `cooptypes` сменить на
 * `ExpenseContract.Tables.Proposals.IProposal` без правки логики.
 */
@Injectable()
export class ExpenseProposalDeltaMapper extends AbstractBlockchainDeltaMapper<
  IExpenseProposalBlockchainData,
  ExpenseProposalDomainEntity
> {
  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly contractInfo: ExpenseContractInfoService
  ) {
    super();
    this.logger.setContext(ExpenseProposalDeltaMapper.name);
  }

  mapDeltaToBlockchainData(delta: IDelta): IExpenseProposalBlockchainData | null {
    try {
      const value = delta.value as IExpenseProposalBlockchainData;
      if (!value) {
        this.logger.warn(`Delta has no value: table=${delta.table}, key=${delta.primary_key}`);
        return null;
      }

      const statement_doc = value.statement_doc
        ? DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.statement_doc as never)
        : undefined;
      const decision_doc = value.decision_doc
        ? DomainToBlockchainUtils.convertChainDocumentToDomainFormat(value.decision_doc as never)
        : undefined;

      return {
        ...value,
        proposal_hash: String(value.proposal_hash).toLowerCase(),
        statement_doc,
        decision_doc,
      };
    } catch (error: any) {
      this.logger.error(`Error mapping delta to blockchain data: ${error.message}`, error.stack);
      return null;
    }
  }

  extractSyncValue(delta: IDelta): string {
    if (!delta.value || !delta.value[this.extractSyncKey()]) {
      throw new Error(`Delta has no value: table=${delta.table}, key=${this.extractSyncKey()}`);
    }
    return String(delta.value[this.extractSyncKey()]).toLowerCase();
  }

  extractSyncKey(): string {
    return ExpenseProposalDomainEntity.getSyncKey();
  }

  getSupportedContractNames(): string[] {
    return this.contractInfo.getSupportedContractNames();
  }

  getSupportedTableNames(): string[] {
    return this.contractInfo.getTablePatterns('proposals');
  }
}
