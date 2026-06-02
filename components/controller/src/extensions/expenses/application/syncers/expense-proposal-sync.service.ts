import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '~/shared/services/abstract-entity-sync.service';
import { ExpenseProposalDomainEntity } from '../../domain/entities/expense-proposal.entity';
import {
  ExpenseProposalRepository,
  EXPENSE_PROPOSAL_REPOSITORY,
} from '../../domain/repositories/expense-proposal.repository';
import { ExpenseProposalDeltaMapper } from '../../infrastructure/blockchain/mappers/expense-proposal-delta.mapper';
import type { IExpenseProposalBlockchainData } from '../../domain/interfaces/expense-proposal-blockchain.interface';

/**
 * Подписка на дельты `expense::proposals` и зеркалирование расходов в локальную БД.
 *
 * Канон capital-style flat (ADR-008 v2 декораторов в репозитории нет).
 * После регистрации контракта `expense` в `cooptypes` маппер автоматически
 * получит точный тип `IProposal` — изменений в syncer'е не потребуется.
 */
@Injectable()
export class ExpenseProposalSyncService
  extends AbstractEntitySyncService<ExpenseProposalDomainEntity, IExpenseProposalBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'ExpenseProposal';

  constructor(
    @Inject(EXPENSE_PROPOSAL_REPOSITORY)
    proposalRepository: ExpenseProposalRepository,
    proposalDeltaMapper: ExpenseProposalDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(proposalRepository, proposalDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.debug(
      `Сервис синхронизации смет расходов инициализирован. Контракты: [${supportedVersions.contracts.join(
        ', '
      )}], таблицы: [${supportedVersions.tables.join(', ')}]`
    );

    const allPatterns = this.getAllEventPatterns();
    this.logger.debug(`Подписка на ${allPatterns.length} паттернов: ${allPatterns.join(', ')}`);
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.processDelta.bind(this));
    });

    this.logger.debug('ExpenseProposalSyncService готов принимать дельты parser2');
  }

  @OnEvent('fork::*')
  async handleExpenseProposalFork(forkData: { block_num: number }): Promise<void> {
    await this.handleFork(forkData.block_num);
  }
}
