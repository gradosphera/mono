import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { CreateCommitDomainInput } from '../../domain/actions/create-commit-domain-input.interface';
import type { RefreshSegmentDomainInput } from '../../domain/actions/refresh-segment-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';
import { TimeTrackingService } from '../services/time-tracking.service';
import { ContributorRepository, CONTRIBUTOR_REPOSITORY } from '../../domain/repositories/contributor.repository';
import type { CapitalContract } from 'cooptypes';
import { config } from '~/config';

/**
 * Интерактор домена для генерации в CAPITAL контракте
 * Обрабатывает действия связанные с коммитами и обновлением сегментов
 */
@Injectable()
export class GenerationInteractor {
  constructor(
    @Inject(CAPITAL_BLOCKCHAIN_PORT)
    private readonly capitalBlockchainPort: CapitalBlockchainPort,
    private readonly timeTrackingService: TimeTrackingService,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository
  ) {}

  /**
   * Создание коммита в CAPITAL контракте
   * Автоматически рассчитывает время на основе незакоммиченных записей
   */
  async createCommit(data: CreateCommitDomainInput): Promise<TransactResult> {
    // Получаем вкладчика по username
    const contributor = await this.contributorRepository.findByUsernameAndCoopname(data.username, data.coopname);

    if (!contributor) {
      throw new Error(`Contributor not found: ${data.username} in coop ${data.coopname}`);
    }

    // Получаем доступное время для коммита
    const availableHours = await this.timeTrackingService.getAvailableCommitHours(
      contributor.contributor_hash,
      data.project_hash
    );

    if (availableHours <= 0) {
      throw new Error('No available time for commit. Please work on active issues first.');
    }

    // Фиксируем время в коммите
    await this.timeTrackingService.commitTime(
      contributor.contributor_hash,
      data.project_hash,
      availableHours,
      data.commit_hash
    );

    // Создаём данные для блокчейна с рассчитанным временем
    const blockchainData: CapitalContract.Actions.CreateCommit.ICommit = {
      ...data,
      creator_hours: `${availableHours.toFixed(config.blockchain.root_govern_precision)} ${
        config.blockchain.root_govern_symbol
      }`,
    };

    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.createCommit(blockchainData);
  }

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  async refreshSegment(data: RefreshSegmentDomainInput): Promise<TransactResult> {
    // Вызываем блокчейн порт
    return await this.capitalBlockchainPort.refreshSegment(data);
  }
}
