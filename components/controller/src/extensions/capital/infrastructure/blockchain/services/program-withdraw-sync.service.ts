import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ProgramWithdrawDomainEntity } from '../../../domain/entities/program-withdraw.entity';
import {
  ProgramWithdrawRepository,
  PROGRAM_WITHDRAW_REPOSITORY,
} from '../../../domain/repositories/program-withdraw.repository';
import { ProgramWithdrawDeltaMapper } from '../mappers/program-withdraw-delta.mapper';
import type { IProgramWithdrawBlockchainData } from '../../../domain/interfaces/program-withdraw-blockchain.interface';

/**
 * Сервис синхронизации возвратов из программы с блокчейном
 *
 * Подписывается на дельты таблицы prgwithdraws контракта capital
 * и синхронизирует данные возвратов из программы в локальной базе данных
 */
@Injectable()
export class ProgramWithdrawSyncService
  extends AbstractEntitySyncService<ProgramWithdrawDomainEntity, IProgramWithdrawBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'ProgramWithdraw';

  constructor(
    @Inject(PROGRAM_WITHDRAW_REPOSITORY)
    programWithdrawRepository: ProgramWithdrawRepository,
    programWithdrawDeltaMapper: ProgramWithdrawDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(programWithdrawRepository, programWithdrawDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `ProgramWithdraw sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleProgramWithdrawDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт возвратов из программы
   */
  @OnEvent('capital::delta::prgwithdraws')
  async handleProgramWithdrawDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для возвратов из программы
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
