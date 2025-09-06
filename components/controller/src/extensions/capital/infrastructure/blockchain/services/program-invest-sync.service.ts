import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ProgramInvestDomainEntity } from '../../../domain/entities/program-invest.entity';
import { ProgramInvestRepository, PROGRAM_INVEST_REPOSITORY } from '../../../domain/repositories/program-invest.repository';
import { ProgramInvestDeltaMapper } from '../mappers/program-invest-delta.mapper';
import type { IProgramInvestBlockchainData } from '../../../domain/interfaces/program-invest-blockchain.interface';

/**
 * Сервис синхронизации программных инвестиций с блокчейном
 *
 * Подписывается на дельты таблицы progrinvests контракта capital
 * и синхронизирует данные программных инвестиций в локальной базе данных
 */
@Injectable()
export class ProgramInvestSyncService
  extends AbstractEntitySyncService<ProgramInvestDomainEntity, IProgramInvestBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'ProgramInvest';

  constructor(
    @Inject(PROGRAM_INVEST_REPOSITORY)
    programInvestRepository: ProgramInvestRepository,
    programInvestDeltaMapper: ProgramInvestDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(programInvestRepository, programInvestDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `ProgramInvest sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleProgramInvestDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт программных инвестиций
   */
  @OnEvent('capital::delta::progrinvests')
  async handleProgramInvestDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для программных инвестиций
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
