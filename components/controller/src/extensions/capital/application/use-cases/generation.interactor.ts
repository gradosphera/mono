import { Injectable, Inject } from '@nestjs/common';
import { CapitalBlockchainPort, CAPITAL_BLOCKCHAIN_PORT } from '../../domain/interfaces/capital-blockchain.port';
import type { CreateCommitDomainInput } from '../../domain/actions/create-commit-domain-input.interface';
import type { CommitApproveDomainInput } from '../../domain/actions/commit-approve-domain-input.interface';
import type { CommitDeclineDomainInput } from '../../domain/actions/commit-decline-domain-input.interface';
import type { TransactResult } from '@wharfkit/session';
import { TimeTrackingService } from '../services/time-tracking.service';
import { ContributorRepository, CONTRIBUTOR_REPOSITORY } from '../../domain/repositories/contributor.repository';
import { CommitRepository, COMMIT_REPOSITORY } from '../../domain/repositories/commit.repository';
import { CommitDomainEntity } from '../../domain/entities/commit.entity';
import type { CapitalContract } from 'cooptypes';
import { PermissionsService } from '../services/permissions.service';
import { CommitStatus } from '../../domain/enums/commit-status.enum';
import { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';

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
    private readonly contributorRepository: ContributorRepository,
    @Inject(COMMIT_REPOSITORY)
    private readonly commitRepository: CommitRepository,
    private readonly permissionsService: PermissionsService,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(GenerationInteractor.name);
  }

  /**
   * Создание коммита в CAPITAL контракте
   * Проверяет доступность указанного количества часов и фиксирует время
   */
  async createCommit(data: CreateCommitDomainInput, _currentUser: MonoAccountDomainInterface): Promise<TransactResult> {
    // Получаем участника по username
    const contributor = await this.contributorRepository.findByUsernameAndCoopname(data.username, data.coopname);

    if (!contributor) {
      throw new Error(`Участник не найден: ${data.username} в кооперативе ${data.coopname}`);
    }

    // Получаем доступное время для коммита
    const availableHours = await this.timeTrackingService.getAvailableCommitHours(
      contributor.contributor_hash,
      data.project_hash
    );

    if (availableHours <= 0) {
      throw new Error('Нет доступного времени для коммита. Пожалуйста, сначала поработайте над завершенными задачами.');
    }

    // Проверяем что запрошенное количество часов не превышает доступное
    if (data.commit_hours > availableHours) {
      throw new Error(
        `Запрошенное количество часов коммита (${data.commit_hours}) превышает доступное время (${availableHours}). ` +
          'Пожалуйста, уменьшите количество часов коммита или завершите больше задач.'
      );
    }

    // Создаём доменную сущность для валидации
    const commitEntity = new CommitDomainEntity({
      _id: '', // будет сгенерирован
      block_num: 0,
      present: false,
      commit_hash: data.commit_hash,
      status: 'pending',
      blockchain_status: 'pending',
    });

    // Создаём и валидируем сущность (без сохранения) и получаем TypeORM сущность
    const createdEntity = await this.commitRepository.create(commitEntity);

    // Создаём данные для блокчейна с указанным временем
    const blockchainData: CapitalContract.Actions.CreateCommit.ICommit = {
      coopname: data.coopname,
      username: data.username,
      description: data.description,
      meta: data.meta,
      project_hash: data.project_hash,
      commit_hash: data.commit_hash,
      creator_hours: data.commit_hours,
    };

    // Вызываем блокчейн порт
    const transactResult = await this.capitalBlockchainPort.createCommit(blockchainData);

    // Фиксируем указанное количество времени в коммите
    await this.timeTrackingService.commitTime(
      contributor.contributor_hash,
      data.project_hash,
      data.commit_hours,
      data.commit_hash
    );
    // Сохраняем сущность в базу данных после успешной транзакции
    await this.commitRepository.saveCreated(createdEntity);

    return transactResult;
  }

  /**
   * Одобрение коммита в CAPITAL контракте
   */
  async approveCommit(data: CommitApproveDomainInput): Promise<CommitDomainEntity> {
    // Получаем коммит для проверки прав доступа
    const commit = await this.commitRepository.findByCommitHash(data.commit_hash);
    if (!commit) {
      throw new Error(`Коммит с хешем ${data.commit_hash} не найден`);
    }

    if (!commit.project_hash) {
      throw new Error('Коммит не связан с проектом');
    }

    // Проверяем, что текущий пользователь является мастером проекта или компонента
    const isMaster = await this.permissionsService.isProjectOrComponentMaster(data.master, commit.project_hash);
    if (!isMaster) {
      throw new Error('У вас нет прав для одобрения этого коммита. Только мастер проекта может одобрять коммиты.');
    }

    // Создаём данные для блокчейна
    const blockchainData: CapitalContract.Actions.CommitApprove.ICommitApprove = {
      coopname: data.coopname,
      master: data.master,
      commit_hash: data.commit_hash,
    };

    // Вызываем блокчейн порт
    await this.capitalBlockchainPort.approveCommit(blockchainData);

    // Обновляем статус в базе данных
    commit.status = CommitStatus.APPROVED;

    // Не сохраняем в базу данных, так как статус будет обновлен через блокчейн

    // Возвращаем обновленный коммит
    return commit;
  }

  /**
   * Отклонение коммита в CAPITAL контракте
   */
  async declineCommit(data: CommitDeclineDomainInput): Promise<CommitDomainEntity> {
    // Получаем коммит для проверки прав доступа
    const commit = await this.commitRepository.findByCommitHash(data.commit_hash);
    if (!commit) {
      throw new Error(`Коммит с хешем ${data.commit_hash} не найден`);
    }

    if (!commit.project_hash) {
      throw new Error('Коммит не связан с проектом');
    }

    // Проверяем, что текущий пользователь является мастером проекта или компонента
    const isMaster = await this.permissionsService.isProjectOrComponentMaster(data.master, commit.project_hash);
    if (!isMaster) {
      throw new Error('У вас нет прав для отклонения этого коммита. Только мастер проекта может отклонять коммиты.');
    }

    // Обновляем статус в базе данных
    commit.status = CommitStatus.DECLINED;
    await this.commitRepository.save(commit);

    // Создаём данные для блокчейна
    const blockchainData: CapitalContract.Actions.CommitDecline.ICommitDecline = {
      coopname: data.coopname,
      master: data.master,
      commit_hash: data.commit_hash,
      reason: data.reason,
    };

    // Вызываем блокчейн порт
    await this.capitalBlockchainPort.declineCommit(blockchainData);

    // Возвращаем обновленный коммит
    return commit;
  }

  /**
   * Обработать одобрение коммита из блокчейна
   */
  async handleApproveCommit(actionData: ActionDomainInterface): Promise<void> {
    try {
      const { data, block_num } = actionData;
      const actionPayload = data as CapitalContract.Actions.CommitApprove.ICommitApprove;

      this.logger.debug(`Обработка одобрения коммита ${actionPayload.commit_hash} в блоке ${block_num}`);

      // Найти коммит по commit_hash
      const commit = await this.commitRepository.findByCommitHash(actionPayload.commit_hash);

      if (!commit) {
        this.logger.warn(`Коммит ${actionPayload.commit_hash} не найден для одобрения`);
        return;
      }

      // Обновить статус и блок
      commit.status = CommitStatus.APPROVED;
      commit.block_num = block_num;

      // Сохранить изменения
      await this.commitRepository.save(commit);

      this.logger.debug(`Коммит ${actionPayload.commit_hash} одобрен`);
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке одобрения коммита: ${error?.message}`, error?.stack);
    }
  }

  /**
   * Обработать отклонение коммита из блокчейна
   */
  async handleDeclineCommit(actionData: ActionDomainInterface): Promise<void> {
    try {
      const { data, block_num } = actionData;
      const actionPayload = data as CapitalContract.Actions.CommitDecline.ICommitDecline;

      this.logger.debug(`Обработка отклонения коммита ${actionPayload.commit_hash} в блоке ${block_num}`);

      // Найти коммит по commit_hash
      const commit = await this.commitRepository.findByCommitHash(actionPayload.commit_hash);

      if (!commit) {
        this.logger.warn(`Коммит ${actionPayload.commit_hash} не найден для отклонения`);
        return;
      }

      // Обновить статус и блок
      commit.status = CommitStatus.DECLINED;
      commit.block_num = block_num;

      // Сохранить изменения
      await this.commitRepository.save(commit);

      this.logger.debug(`Коммит ${actionPayload.commit_hash} отклонен`);
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке отклонения коммита: ${error?.message}`, error?.stack);
    }
  }
}
