import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { VoteDomainEntity } from '../../../domain/entities/vote.entity';
import { VoteRepository, VOTE_REPOSITORY } from '../../../domain/repositories/vote.repository';
import { VoteDeltaMapper } from '../mappers/vote-delta.mapper';
import type { IVoteBlockchainData } from '../../../domain/interfaces/vote-blockchain.interface';

/**
 * Сервис синхронизации голосов с блокчейном
 *
 * Подписывается на дельты таблицы votes контракта capital
 * и синхронизирует данные голосов в локальной базе данных
 */
@Injectable()
export class VoteSyncService
  extends AbstractEntitySyncService<VoteDomainEntity, IVoteBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Vote';

  constructor(
    @Inject(VOTE_REPOSITORY)
    voteRepository: VoteRepository,
    voteDeltaMapper: VoteDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(voteRepository, voteDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Vote sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleVoteDelta.bind(this));
    });

    this.logger.log('Vote sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт голосов из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleVoteDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for votes: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received vote delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Vote ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling vote delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для голосов
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleVoteFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for votes at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling vote fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: VoteDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для голосов логику после форка
    // Например, очистка связанных данных, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After vote fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
