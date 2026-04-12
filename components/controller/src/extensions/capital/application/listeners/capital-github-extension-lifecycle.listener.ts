import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EXTENSION_APP_TERMINATE_EVENT,
  type ExtensionAppTerminatePayload,
} from '~/domain/extension/extension-app-lifecycle.events';
import { GitHubSyncSchedulerService } from '../../infrastructure/services/github-sync-scheduler.service';
import { CapitalDevelopmentRepositoryGitSyncService } from '../services/capital-development-repository-git-sync.service';

/**
 * При снятии расширения Capital с запуска — останавливаем cron GitHub и прерываем длинные полные индексации.
 */
@Injectable()
export class CapitalGithubExtensionLifecycleListener {
  private readonly logger = new Logger(CapitalGithubExtensionLifecycleListener.name);

  constructor(
    private readonly githubSyncScheduler: GitHubSyncSchedulerService,
    private readonly capitalDevelopmentRepositoryGitSync: CapitalDevelopmentRepositoryGitSyncService
  ) {}

  @OnEvent(EXTENSION_APP_TERMINATE_EVENT)
  handleExtensionTerminate(payload: ExtensionAppTerminatePayload): void {
    if (payload.appName !== 'capital') {
      return;
    }
    this.capitalDevelopmentRepositoryGitSync.abortAllInFlightRepositorySyncs();
    void this.githubSyncScheduler.stop().then(() => {
      this.logger.log('Capital: GitHub polling и фоновые индексации репозиториев остановлены');
    });
  }
}
