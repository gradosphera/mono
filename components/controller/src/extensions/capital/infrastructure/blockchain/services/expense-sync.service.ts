import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ExpenseDomainEntity } from '../../../domain/entities/expense.entity';
import { ExpenseRepository, EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository';
import { ExpenseDeltaMapper } from '../mappers/expense-delta.mapper';
import type { IExpenseBlockchainData } from '../../../domain/interfaces/expense-blockchain.interface';

/**
 * Сервис синхронизации расходов с блокчейном
 *
 * Подписывается на дельты таблицы expenses контракта capital
 * и синхронизирует данные расходов в локальной базе данных
 */
@Injectable()
export class ExpenseSyncService
  extends AbstractEntitySyncService<ExpenseDomainEntity, IExpenseBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Expense';

  constructor(
    @Inject(EXPENSE_REPOSITORY)
    expenseRepository: ExpenseRepository,
    expenseDeltaMapper: ExpenseDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(expenseRepository, expenseDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Expense sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleExpenseDelta.bind(this));
    });

    this.logger.log('Expense sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт расходов из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleExpenseDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for expenses: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received expense delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Expense ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling expense delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для расходов
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleExpenseFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for expenses at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling expense fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: ExpenseDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для расходов логику после форка
    // Например, очистка связанных данных, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After expense fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
