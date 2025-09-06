import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import type { IDelta } from '~/types/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { AbstractEntitySyncService } from '../../../../../shared/services/abstract-entity-sync.service';
import { ProjectPropertyDomainEntity } from '../../../domain/entities/project-property.entity';
import {
  ProjectPropertyRepository,
  PROJECT_PROPERTY_REPOSITORY,
} from '../../../domain/repositories/project-property.repository';
import { ProjectPropertyDeltaMapper } from '../mappers/project-property-delta.mapper';
import type { IProjectPropertyBlockchainData } from '../../../domain/interfaces/project-property-blockchain.interface';

/**
 * Сервис синхронизации проектных имущественных взносов с блокчейном
 *
 * Подписывается на дельты таблицы pjproperties контракта capital
 * и синхронизирует данные проектных имущественных взносов в локальной базе данных
 */
@Injectable()
export class ProjectPropertySyncService
  extends AbstractEntitySyncService<ProjectPropertyDomainEntity, IProjectPropertyBlockchainData>
  implements OnModuleInit
{
  protected readonly entityName = 'ProjectProperty';

  constructor(
    @Inject(PROJECT_PROPERTY_REPOSITORY)
    projectPropertyRepository: ProjectPropertyRepository,
    projectPropertyDeltaMapper: ProjectPropertyDeltaMapper,
    logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super(projectPropertyRepository, projectPropertyDeltaMapper, logger);
  }

  async onModuleInit() {
    const supportedVersions = this.getSupportedVersions();
    this.logger.log(
      `ProjectProperty sync service initialized. Supporting contracts: [${supportedVersions.contracts.join(
        ', '
      )}], tables: [${supportedVersions.tables.join(', ')}]`
    );

    // Программная подписка на все поддерживаемые паттерны событий
    const allPatterns = this.getAllEventPatterns();
    this.logger.log(`Subscribing to ${allPatterns.length} event patterns: ${allPatterns.join(', ')}`);

    // Подписываемся на каждый паттерн программно
    allPatterns.forEach((pattern) => {
      this.eventEmitter.on(pattern, this.handleProjectPropertyDelta.bind(this));
    });
  }

  /**
   * Обработчик дельт проектных имущественных взносов
   */
  @OnEvent('capital::delta::pjproperties')
  async handleProjectPropertyDelta(delta: IDelta): Promise<void> {
    await this.processDelta(delta);
  }

  /**
   * Обработчик форков для проектных имущественных взносов
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
