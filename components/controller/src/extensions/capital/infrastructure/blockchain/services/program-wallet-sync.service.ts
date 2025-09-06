import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ProgramWalletDomainEntity } from '../../../domain/entities/program-wallet.entity';
import { ProgramWalletRepository, PROGRAM_WALLET_REPOSITORY } from '../../../domain/repositories/program-wallet.repository';
import { ProgramWalletDeltaMapper } from '../mappers/program-wallet-delta.mapper';
import type { IProgramWalletBlockchainData } from '../../../domain/interfaces/program-wallet-blockchain.interface';

/**
 * Сервис синхронизации программных кошельков с блокчейном
 *
 * Подписывается на дельты таблицы capwallets контракта capital
 * и синхронизирует данные программных кошельков в локальной базе данных
 */
@Injectable()
export class ProgramWalletSyncService
  extends AbstractEntitySyncService<ProgramWalletDomainEntity, IProgramWalletBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'ProgramWallet';

  constructor(
    @Inject(PROGRAM_WALLET_REPOSITORY)
    programWalletRepository: ProgramWalletRepository,
    programWalletDeltaMapper: ProgramWalletDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(programWalletRepository, programWalletDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `ProgramWallet sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleProgramWalletDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт программных кошельков
   */
  @OnEvent('capital::delta::capwallets')
  async handleProgramWalletDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для программных кошельков
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
