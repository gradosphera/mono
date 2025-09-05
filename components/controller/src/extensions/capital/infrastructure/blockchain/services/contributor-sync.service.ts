import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ContributorDomainEntity } from '../../../domain/entities/contributor.entity';
import { ContributorRepository, CONTRIBUTOR_REPOSITORY } from '../../../domain/repositories/contributor.repository';
import { ContributorDeltaMapper } from '../mappers/contributor-delta.mapper';
import type { IContributorBlockchainData } from '../../../domain/interfaces/contributor-blockchain.interface';

/**
 * Сервис синхронизации вкладчиков с блокчейном
 *
 * Подписывается на дельты таблицы contributors контракта capital
 * и синхронизирует данные вкладчиков в локальной базе данных
 */
@Injectable()
export class ContributorSyncService
  extends AbstractEntitySyncService<ContributorDomainEntity, IContributorBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Contributor';

  constructor(
    @Inject(CONTRIBUTOR_REPOSITORY)
    contributorRepository: ContributorRepository,
    contributorDeltaMapper: ContributorDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(contributorRepository, contributorDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Contributor sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventNames();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleContributorDelta.bind(this));
    });

    this.logger.log('Contributor sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт вкладчиков из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleContributorDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for contributors: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received contributor delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Contributor ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling contributor delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для вкладчиков
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleContributorFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for contributors at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling contributor fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: ContributorDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для вкладчиков логику после форка
    // Например, очистка связанных данных, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After contributor fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных (contributions, etc.)
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
