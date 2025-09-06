import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ProgramPropertyDomainEntity } from '../../../domain/entities/program-property.entity';
import {
  ProgramPropertyRepository,
  PROGRAM_PROPERTY_REPOSITORY,
} from '../../../domain/repositories/program-property.repository';
import { ProgramPropertyDeltaMapper } from '../mappers/program-property-delta.mapper';
import type { IProgramPropertyBlockchainData } from '../../../domain/interfaces/program-property-blockchain.interface';

/**
 * Сервис синхронизации программных имущественных взносов с блокчейном
 *
 * Подписывается на дельты таблицы pgproperties контракта capital
 * и синхронизирует данные программных имущественных взносов в локальной базе данных
 */
@Injectable()
export class ProgramPropertySyncService
  extends AbstractEntitySyncService<ProgramPropertyDomainEntity, IProgramPropertyBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'ProgramProperty';

  constructor(
    @Inject(PROGRAM_PROPERTY_REPOSITORY)
    programPropertyRepository: ProgramPropertyRepository,
    programPropertyDeltaMapper: ProgramPropertyDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(programPropertyRepository, programPropertyDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `ProgramProperty sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleProgramPropertyDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт программных имущественных взносов
   */
  @OnEvent('capital::delta::pgproperties')
  async handleProgramPropertyDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для программных имущественных взносов
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
