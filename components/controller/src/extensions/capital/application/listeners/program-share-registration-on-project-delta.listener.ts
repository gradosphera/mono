import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CapitalContract } from 'cooptypes';
import config from '~/config/config';
import type { IDelta } from '~/types/common';
import { ProjectStatus } from '../../domain/enums/project-status.enum';
import { ProgramShareRegistrationService } from '../services/program-share-registration.service';

/**
 * Слушатель дельт `capital::projects`. Как только в блокчейне появляется проект
 * (в т.ч. компонент) в статусе pending|active — СРАЗУ регистрирует доли всех
 * активных пайщиков Благороста в нём, не дожидаясь периодического scheduler'а.
 *
 * Why: окно между созданием проекта и его переводом в `result` может быть
 * минутами. Контракт `regshare` принимает только pending|active, а отката
 * `result → active` нет — пайщики, не успевшие попасть до закрытия окна, теряют
 * долю в компоненте безвозвратно (инцидент voskhod, компонент 011bcd92…,
 * 2026-06-16). Событие закрывает это окно. Зеркалит
 * `ProgramShareRegistrationOnUserWalletDeltaListener` (тот реагирует на
 * изменение баланса, этот — на появление проекта).
 *
 * Неблокирующий: обработчик получает событие и неспешно обходит пайщиков;
 * на dispatch-pipeline/парсер не влияет (EventEmitter2.emit — fire-and-forget).
 * Промахи (downtime/потеря события) подбирает периодический scheduler-бэкстоп.
 */
@Injectable()
export class ProgramShareRegistrationOnProjectDeltaListener {
  private readonly logger = new Logger(ProgramShareRegistrationOnProjectDeltaListener.name);

  constructor(
    private readonly programShareRegistrationService: ProgramShareRegistrationService
  ) {}

  @OnEvent(`delta::${CapitalContract.contractName.production}::${CapitalContract.Tables.Projects.tableName}`)
  async handleProjectDelta(delta: IDelta): Promise<void> {
    if (!delta.present) return;
    if (delta.scope !== config.coopname) return;

    const value = delta.value as CapitalContract.Tables.Projects.IProject | undefined;
    if (!value?.project_hash) return;

    // regshare разрешён только для pending|active — на прочих статусах окно уже
    // закрыто (on-chain-проверка всё равно отклонит), реагировать незачем.
    const status = String(value.status);
    if (status !== ProjectStatus.PENDING && status !== ProjectStatus.ACTIVE) return;

    const project_hash = String(value.project_hash);
    try {
      await this.programShareRegistrationService.syncProgramSharesForProject(
        delta.scope,
        project_hash
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.warn(
        `regshare event-driven (project) sync не выполнен: coop=${delta.scope} project=${project_hash}: ${message}`,
        stack
      );
    }
  }
}
