import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_EXTENSION_PORT, AccountExtensionPort } from '~/domain/extension/ports/account-extension-port';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import { Workflows } from '@coopenomics/notifications';

/**
 * Сервис для отправки уведомлений участникам
 */
@Injectable()
export class ParticipantNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_EXTENSION_PORT)
    private readonly accountPort: AccountExtensionPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ParticipantNotificationService.name);
  }

  async onModuleInit() {
    this.logger.log('ParticipantNotificationService инициализирован');
  }

  /**
   * Отправить приветственное уведомление новому пайщику после успешной регистрации
   */
  async sendWelcomeNotification(username: string): Promise<void> {
    try {
      this.logger.debug(`Отправка приветственного уведомления пользователю ${username}`);

      // Получаем пользователя через порт
      const user = await this.accountPort.getAccount(username);
      const userEmail = user.provider_account?.email;
      if (!userEmail) {
        this.logger.warn(`Email пользователя ${username} не найден`);
        return;
      }

      // Получаем отображаемое имя пользователя
      const userName = await this.accountPort.getDisplayName(username);

      // Формируем данные для workflow (без приватных данных)
      const payload: Workflows.Welcome.IPayload = {
        userName,
      };

      // Отправляем уведомление
      const triggerData: WorkflowTriggerDomainInterface = {
        name: Workflows.Welcome.id,
        to: {
          subscriberId: username,
          email: userEmail,
        },
        payload,
      };

      await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      this.logger.log(`Приветственное уведомление отправлено пользователю ${username}`);
    } catch (error: any) {
      this.logger.error(`Ошибка при отправке приветственного уведомления: ${error.message}`, error.stack);
    }
  }
}
