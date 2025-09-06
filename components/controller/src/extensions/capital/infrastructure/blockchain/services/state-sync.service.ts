import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { StateDomainEntity } from '../../../domain/entities/state.entity';
import { StateRepository, STATE_REPOSITORY } from '../../../domain/repositories/state.repository';
import { StateDeltaMapper } from '../mappers/state-delta.mapper';
import type { IStateBlockchainData } from '../../../domain/interfaces/state-blockchain.interface';

/**
 * Сервис синхронизации состояния кооператива с блокчейном
 *
 * Подписывается на дельты таблицы state контракта capital
 * и синхронизирует данные состояния в локальной базе данных
 */
@Injectable()
export class StateSyncService
  extends AbstractEntitySyncService<StateDomainEntity, IStateBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'State';

  constructor(
    @Inject(STATE_REPOSITORY)
    stateRepository: StateRepository,
    stateDeltaMapper: StateDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(stateRepository, stateDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `State sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleStateDelta.bind(this));
    });

    this.logger.log('State sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт состояния из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleStateDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for state: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received state delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `State ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling state delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для состояния
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleStateFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for state at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling state fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: StateDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для состояния логику после форка
    // Например, очистка кеша, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After state fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
