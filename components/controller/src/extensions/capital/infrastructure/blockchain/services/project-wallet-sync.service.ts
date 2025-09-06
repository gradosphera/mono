import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
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
    this.logger.log(
      `ProjectWallet sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleProjectWalletDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт проектных кошельков
   */
  @OnEvent('capital::delta::projwallets')
  async handleProjectWalletDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для проектных кошельков
   */
  @OnEvent('capital::fork')
  async handleFork(blockNum: number): Promise<void> {
    await this.handleFork(blockNum);
  }

  /**
   * Получение поддерживаемых версий контрактов и таблиц
   */
  public getSupportedVersions(): { contracts: string[]; tables: string[] } {
    return {
      contracts: this.mapper.getSupportedContractNames(),
      tables: this.mapper.getSupportedTableNames(),
    };
  }

  /**
   * Получение всех паттернов событий для подписки
   */
  public getAllEventPatterns(): string[] {
    return this.mapper.getAllEventPatterns();
  }
}
