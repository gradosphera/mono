import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { EventsService } from '~/infrastructure/events/events.service';
import { config } from '~/config';
import { CapitalContractInfoService } from '../../services/capital-contract-info.service';

/**
 * Сервис для отслеживания дельт блокчейна в рамках Capital extension
 *
 * Подписывается на дельты всех поддерживаемых версий контрактов и эмитирует
 * специфичные события для каждой таблицы
 */
@Injectable()
export class BlockchainDeltaTrackerService implements OnModuleInit {
  private readonly coopname = config.coopname;

  constructor(
    private readonly logger: WinstonLoggerService,
    private readonly eventsService: EventsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly contractInfo: CapitalContractInfoService
  ) {
    this.logger.setContext(BlockchainDeltaTrackerService.name);
  }

  async onModuleInit() {
    // Получаем поддерживаемые версии контрактов из сервиса
    const supportedContracts = this.contractInfo.getSupportedContractNames();
    this.logger.log(`Subscribing to supported contract versions: [${supportedContracts.join(', ')}]`);

    supportedContracts.forEach((contractName) => {
      const pattern = `delta::${contractName}::*`;
      this.eventEmitter.on(pattern, this.handleContractDelta.bind(this));
      this.logger.debug(`Subscribed to pattern: ${pattern}`);
    });

    this.logger.log('Capital blockchain delta tracker initialized with pattern subscriptions');
  }

  /**
   * Обработка дельт контракта
   * Вызывается программно для всех поддерживаемых версий контрактов
   */
  private async handleContractDelta(delta: IDelta): Promise<void> {
    try {
      // Проверяем, что дельта относится к нашему кооперативу
      if (delta.value?.coopname !== this.coopname) {
        return;
      }

      this.logger.debug(
        `Processing ${delta.code} delta: table=${delta.table}, primary_key=${delta.primary_key}, block=${delta.block_num}`
      );

      // Эмитируем специфичное событие для таблицы
      const specificEventName = `${delta.code}::${delta.table}::handler`;
      this.eventsService.emit(specificEventName, delta);

      this.logger.debug(`Emitted table update event: ${specificEventName}`);
    } catch (error: any) {
      this.logger.error(`Error handling ${delta.code} delta: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Обработка форков для capital контракта
   */
  @OnEvent('fork::*')
  async handleFork(forkData: { block_num: number }): Promise<void> {
    try {
      const { block_num: forkBlockNum } = forkData;

      this.logger.log(`Processing fork for capital contract at block ${forkBlockNum}`);

      // Эмитируем событие форка для capital контракта
      this.eventsService.emit('capital::fork', { block_num: forkBlockNum });

      this.logger.log(`Emitted capital fork event for block ${forkBlockNum}`);
    } catch (error: any) {
      this.logger.error(`Error handling fork for capital: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Получение имени кооператива
   */
  getCoopname(): string {
    return this.coopname;
  }
}
