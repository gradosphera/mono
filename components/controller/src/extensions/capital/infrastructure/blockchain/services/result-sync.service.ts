import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ResultDomainEntity } from '../../../domain/entities/result.entity';
import { ResultRepository, RESULT_REPOSITORY } from '../../../domain/repositories/result.repository';
import { ResultDeltaMapper } from '../mappers/result-delta.mapper';
import type { IResultBlockchainData } from '../../../domain/interfaces/result-blockchain.interface';

/**
 * Сервис синхронизации результатов с блокчейном
 *
 * Подписывается на дельты таблицы results контракта capital
 * и синхронизирует данные результатов в локальной базе данных
 */
@Injectable()
export class ResultSyncService
  extends AbstractEntitySyncService<ResultDomainEntity, IResultBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Result';

  constructor(
    @Inject(RESULT_REPOSITORY)
    resultRepository: ResultRepository,
    resultDeltaMapper: ResultDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(resultRepository, resultDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Result sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleResultDelta.bind(this));
    });

    this.logger.log('Result sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт результатов из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleResultDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for results: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received result delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Result ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling result delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для результатов
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleResultFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for results at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling result fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: ResultDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для результатов логику после форка
    // Например, очистка связанных данных, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After result fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
