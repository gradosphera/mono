import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ProjectWalletDomainEntity } from '../../../domain/entities/project-wallet.entity';
import { ProjectWalletRepository, PROJECT_WALLET_REPOSITORY } from '../../../domain/repositories/project-wallet.repository';
import { ProjectWalletDeltaMapper } from '../mappers/project-wallet-delta.mapper';
import type { IProjectWalletBlockchainData } from '../../../domain/interfaces/project-wallet-blockchain.interface';

/**
 * Сервис синхронизации проектных кошельков с блокчейном
 *
 * Подписывается на дельты таблицы projwallets контракта capital
 * и синхронизирует данные проектных кошельков в локальной базе данных
 */
@Injectable()
export class ProjectWalletSyncService
  extends AbstractEntitySyncService<ProjectWalletDomainEntity, IProjectWalletBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'ProjectWallet';

  constructor(
    @Inject(PROJECT_WALLET_REPOSITORY)
    projectWalletRepository: ProjectWalletRepository,
    projectWalletDeltaMapper: ProjectWalletDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(projectWalletRepository, projectWalletDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.debug(
      `Сервис синхронизации проектных кошельков инициализирован. Поддерживаемые контракты: [${supportedVersions.contracts.join(
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
  }

  /**
   * Обработчик форков для проектных кошельков
   */
  @OnEvent('fork::*')
  async handleProjectWalletFork(forkData: { block_num: number }): Promise<void> {
    await this.handleFork(forkData.block_num);
  }
}
