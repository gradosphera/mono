import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { CommitDomainEntity } from '../../../domain/entities/commit.entity';
import { CommitRepository, COMMIT_REPOSITORY } from '../../../domain/repositories/commit.repository';
import { CommitDeltaMapper } from '../mappers/commit-delta.mapper';
import type { ICommitBlockchainData } from '../../../domain/interfaces/commit-blockchain.interface';

/**
 * Сервис синхронизации коммитов с блокчейном
 *
 * Подписывается на дельты таблицы commits контракта capital
 * и синхронизирует данные коммитов в локальной базе данных
 */
@Injectable()
export class CommitSyncService
  extends AbstractEntitySyncService<CommitDomainEntity, ICommitBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Commit';

  constructor(
    @Inject(COMMIT_REPOSITORY)
    commitRepository: CommitRepository,
    commitDeltaMapper: CommitDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(commitRepository, commitDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Commit sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleCommitDelta.bind(this));
    });

    this.logger.log('Commit sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт коммитов из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleCommitDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for commits: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received commit delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Commit ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling commit delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для коммитов
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleCommitFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for commits at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling commit fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: CommitDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для коммитов логику после форка
    // Например, очистка связанных данных, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After commit fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
