import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { DebtDomainEntity } from '../../../domain/entities/debt.entity';
import { DebtRepository, DEBT_REPOSITORY } from '../../../domain/repositories/debt.repository';
import { DebtDeltaMapper } from '../mappers/debt-delta.mapper';
import type { IDebtBlockchainData } from '../../../domain/interfaces/debt-blockchain.interface';

/**
 * Сервис синхронизации долгов с блокчейном
 *
 * Подписывается на дельты таблицы debts контракта capital
 * и синхронизирует данные долгов в локальной базе данных
 */
@Injectable()
export class DebtSyncService
  extends AbstractEntitySyncService<DebtDomainEntity, IDebtBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Debt';

  constructor(
    @Inject(DEBT_REPOSITORY)
    debtRepository: DebtRepository,
    debtDeltaMapper: DebtDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(debtRepository, debtDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Debt sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleDebtDelta.bind(this));
    });

    this.logger.log('Debt sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт долгов из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleDebtDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for debts: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received debt delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Debt ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling debt delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для долгов
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleDebtFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for debts at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling debt fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: DebtDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для долгов логику после форка
    // Например, очистка связанных данных, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After debt fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
