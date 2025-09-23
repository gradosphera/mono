import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
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
    this.logger.debug(
      `Сервис синхронизации результатов инициализирован. Поддерживаемые контракты: [${supportedVersions.contracts.join(
        ', '
      )}], таблицы: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.debug(`Подписка на ${allPatterns.length} паттернов событий: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.processDelta.bind(this));
    });

    this.logger.debug('Сервис синхронизации результатов полностью инициализирован с подписками на паттерны');
  }

  /**
   * Обработка форков для результатов
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleResultFork(forkData: { block_num: number }): Promise<void> {
    await this.handleFork(forkData.block_num);
  }
}
