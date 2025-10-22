import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../shared/services/abstract-entity-sync.service';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorRepository, CONTRIBUTOR_REPOSITORY } from '../../domain/repositories/contributor.repository';
import { ContributorDeltaMapper } from '../../infrastructure/blockchain/mappers/contributor-delta.mapper';
import type { IContributorBlockchainData } from '../../domain/interfaces/contributor-blockchain.interface';

/**
 * Сервис синхронизации участников с блокчейном
 *
 * Подписывается на дельты таблицы contributors контракта capital
 * и синхронизирует данные участников в локальной базе данных
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
    this.logger.debug(
      `Сервис синхронизации участников инициализирован. Поддерживаемые контракты: [${supportedVersions.contracts.join(
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

    this.logger.debug('Сервис синхронизации участников полностью инициализирован с подписками на паттерны');
  }

  /**
   * Обработка форков для участников
   * Теперь подписывается на все форки независимо от контракта
   */
  @OnEvent('fork::*')
  async handleContributorFork(forkData: { block_num: number }): Promise<void> {
    await this.handleFork(forkData.block_num);
  }
}
