// infrastructure/blockchain/blockchain-consumer.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { IAction, IDelta } from '~/types/common';
import { RedisStreamService, StreamMessage } from '~/infrastructure/redis/redis-stream.service';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { EventsService } from '~/infrastructure/events/events.service';

export interface BlockchainEventData {
  type: string;
  event?: IAction;
  delta?: IDelta;
  block_num?: number;
}

/**
 * Инфраструктурный сервис потребления событий блокчейна из Redis
 * Читает события из Redis стрима и публикует их во внутреннюю шину событий
 * Не содержит бизнес-логики, только предварительную фильтрацию
 */
@Injectable()
export class BlockchainConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly streamName = 'notifications';
  private readonly consumerGroup = 'blockchain-consumer';
  private readonly consumerName: string;

  constructor(
    private readonly redisStreamService: RedisStreamService,
    private readonly logger: WinstonLoggerService,
    private readonly eventsService: EventsService
  ) {
    this.logger.setContext(BlockchainConsumerService.name);
    this.consumerName = `consumer-${Math.random().toString(36).substr(2, 9)}`;
  }

  async onModuleInit() {
    this.logger.log('Initializing blockchain consumer service');

    // Создаем consumer group
    await this.redisStreamService.createConsumerGroup(this.streamName, this.consumerGroup);

    // Запускаем потребление сообщений
    this.startConsuming();
  }

  onModuleDestroy() {
    this.logger.log('Stopping blockchain consumer service');
    this.redisStreamService.stopConsumer(this.streamName, this.consumerGroup, this.consumerName);
  }

  /**
   * Запуск потребления сообщений из Redis стрима
   */
  private async startConsuming(): Promise<void> {
    this.logger.log(`Starting consumer ${this.consumerName} for stream ${this.streamName}`);

    await this.redisStreamService.startConsumer(
      {
        stream: this.streamName,
        group: this.consumerGroup,
        consumer: this.consumerName,
        count: 1,
        block: 1000,
      },
      this.handleMessage.bind(this)
    );
  }

  /**
   * Обработка входящего сообщения из стрима
   */
  private async handleMessage(message: StreamMessage): Promise<void> {
    try {
      const eventData: BlockchainEventData = JSON.parse(
        message.fields.event || message.fields.delta || message.fields.fork || '{}'
      );

      if (eventData.event) {
        await this.processAction(eventData.event);
      } else if (eventData.delta) {
        await this.processDelta(eventData.delta);
      } else if (eventData.block_num !== undefined) {
        await this.processFork(eventData.block_num);
      } else {
        this.logger.warn(`Unknown message format: ${JSON.stringify(message.fields)}`);
      }
    } catch (error: any) {
      this.logger.error(`Error processing message ${message.messageId}: ${error.message}`, error.stack);
      throw error; // Перебрасываем ошибку чтобы сообщение не было подтверждено
    }
  }

  /**
   * Обработка действия (action) из блокчейна
   * Выполняет минимальную предварительную фильтрацию и публикует событие во внутреннюю шину
   */
  private async processAction(action: IAction): Promise<void> {
    this.logger.debug(`Processing action: ${action.name} from ${action.account}: ${JSON.stringify(action.data)}`);

    // Публикуем событие во внутреннюю шину с типизированным именем
    const eventName = `action::${action.account}::${action.name}`;
    this.eventsService.emit(eventName, action);

    this.logger.debug(`Action published to event bus: ${eventName} with sequence ${action.global_sequence}`);
  }

  /**
   * Обработка дельты (delta) из блокчейна
   * Выполняет минимальную предварительную фильтрацию и публикует событие во внутреннюю шину
   */
  private async processDelta(delta: IDelta): Promise<void> {
    this.logger.debug(`Processing delta: ${delta.table} from ${delta.code}`);

    // Публикуем событие во внутреннюю шину с типизированным именем
    const eventName = `delta::${delta.code}::${delta.table}`;
    this.eventsService.emit(eventName, delta);

    this.logger.debug(`Delta published to event bus: ${eventName} with primary_key ${delta.primary_key}`);
  }

  /**
   * Обработка форка (fork) из блокчейна
   * Публикует событие форка во внутреннюю шину
   */
  private async processFork(block_num: number): Promise<void> {
    this.logger.debug(`Processing fork at block: ${block_num}`);

    // Публикуем событие во внутреннюю шину с типизированным именем
    const eventName = `fork`;
    this.eventsService.emit(eventName, { block_num });

    this.logger.debug(`Fork published to event bus: ${eventName}`);
  }
}
