import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { InvestDomainEntity } from '../../../domain/entities/invest.entity';
import { InvestRepository, INVEST_REPOSITORY } from '../../../domain/repositories/invest.repository';
import { InvestDeltaMapper } from '../mappers/invest-delta.mapper';
import type { IInvestBlockchainData } from '../../../domain/interfaces/invest-blockchain.interface';

/**
 * Сервис синхронизации инвестиций с блокчейном
 *
 * Подписывается на дельты таблицы invests контракта capital
 * и синхронизирует данные инвестиций в локальной базе данных
 */
@Injectable()
export class InvestSyncService
  extends AbstractEntitySyncService<InvestDomainEntity, IInvestBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'Invest';

  constructor(
    @Inject(INVEST_REPOSITORY)
    investRepository: InvestRepository,
    investDeltaMapper: InvestDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(investRepository, investDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `Invest sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleInvestDelta.bind(this));
    });

    this.logger.log('Invest sync service fully initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт инвестиций из блокчейна
   * Теперь вызывается программно для всех поддерживаемых паттернов
   */
  private async handleInvestDelta(delta: IDelta): Promise<void> {
    try {
      // Дополнительная проверка релевантности через маппер
      if (!this.mapper.isRelevantDelta(delta)) {
        this.logger.debug(`Delta is not relevant for invests: contract=${delta.code}, table=${delta.table}`);
        return;
      }

      this.logger.debug(
        `Received invest delta for key ${delta.primary_key} at block ${delta.block_num} from ${delta.code}::${delta.table}`
      );

      const result = await this.processDelta(delta);

      if (result) {
        const action = result.created ? 'created' : result.updated ? 'updated' : 'processed';
        this.logger.log(
          `Invest ${result.blockchainId} ${action} at block ${result.blockNum} from ${delta.code}::${delta.table}`
        );
      }
    } catch (error: any) {
      this.logger.error(`Error handling invest delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для инвестиций
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleInvestFork(forkData: { block_num: number }): Promise<void> {
    try {
      this.logger.debug(`Handling fork for invests at block ${forkData.block_num}`);
      await this.handleFork(forkData.block_num);
    } catch (error: any) {
      this.logger.error(`Error handling invest fork: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Дополнительные действия после обработки форка
   */
  protected async afterForkProcessing(forkBlockNum: number, affectedEntities: InvestDomainEntity[]): Promise<void> {
    // Здесь можно добавить специфичную для инвестиций логику после форка
    // Например, очистка связанных данных, уведомления и т.д.

    if (affectedEntities.length > 0) {
      this.logger.log(`After invest fork processing: ${affectedEntities.length} entities were affected`);

      // Можно добавить дополнительную логику:
      // - Очистка связанных данных (results, etc.)
      // - Уведомления пользователей
      // - Обновление агрегированных данных
    }
  }
}
