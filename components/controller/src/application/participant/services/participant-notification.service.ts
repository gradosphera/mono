import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_DATA_PORT, AccountDataPort } from '~/domain/account/ports/account-data.port';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import { Workflows } from '@coopenomics/notifications';
import config from '~/config/config';

/**
 * Сервис для отправки уведомлений участникам
 */
@Injectable()
export class ParticipantNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_DATA_PORT)
    private readonly accountPort: AccountDataPort,
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

  /**
   * Отправить уведомление председателю о новом заявке на вступительный взнос
   */
  async sendNewInitialPaymentNotification(
    participantUsername: string,
    paymentAmount: string,
    paymentCurrency: string,
    coopname: string
  ): Promise<void> {
    try {
      this.logger.debug(`Отправка уведомления председателю о новой заявке на вступительный взнос от ${participantUsername}`);

      // Получаем председателя через порт
      const chairmen = await this.accountPort.getAccounts({ role: 'chairman' }, { page: 1, limit: 1, sortOrder: 'ASC' });
      if (!chairmen.items || chairmen.items.length === 0) {
        this.logger.warn('Председатель не найден, пропускаем отправку уведомления');
        return;
      }

      const chairman = chairmen.items[0];
      const chairmanEmail = chairman.provider_account?.email;
      if (!chairmanEmail) {
        this.logger.warn(`Email председателя ${chairman.username} не найден`);
        return;
      }

      // Получаем отображаемые имена
      const chairmanName = await this.accountPort.getDisplayName(chairman.username);
      const participantName = await this.accountPort.getDisplayName(participantUsername);

      // Формируем данные для workflow
      const payload: Workflows.NewInitialPaymentRequest.IPayload = {
        chairmanName,
        participantName,
        paymentAmount,
        paymentCurrency,
        paymentType: 'Вступительный и минимальный паевой взнос',
        coopname,
        paymentUrl: `${config.base_url}`,
      };

      // Отправляем уведомление
      const triggerData: WorkflowTriggerDomainInterface = {
        name: Workflows.NewInitialPaymentRequest.id,
        to: {
          subscriberId: chairman.username,
          email: chairmanEmail,
        },
        payload,
      };

      await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      this.logger.log(
        `Уведомление отправлено председателю ${chairman.username} о новой заявке на вступительный взнос от ${participantUsername}`
      );
    } catch (error: any) {
      this.logger.error(`Ошибка при отправке уведомления о новом вступительном взносе: ${error.message}`, error.stack);
    }
  }
}
