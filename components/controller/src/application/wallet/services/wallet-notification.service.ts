import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_EXTENSION_PORT, AccountExtensionPort } from '~/domain/extension/ports/account-extension-port';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import { Workflows } from '@coopenomics/notifications';
import config from '~/config/config';

/**
 * Сервис для отправки уведомлений по wallet модулю
 */
@Injectable()
export class WalletNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_EXTENSION_PORT)
    private readonly accountPort: AccountExtensionPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(WalletNotificationService.name);
  }

  async onModuleInit() {
    this.logger.log('WalletNotificationService инициализирован');
  }

  /**
   * Отправить уведомление председателю о новом заявке на паевой взнос
   */
  async sendNewDepositPaymentNotification(
    participantUsername: string,
    paymentAmount: string,
    paymentCurrency: string,
    coopname: string
  ): Promise<void> {
    try {
      this.logger.debug(`Отправка уведомления председателю о новой заявке на паевой взнос от ${participantUsername}`);

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
      const payload: Workflows.NewDepositPaymentRequest.IPayload = {
        chairmanName,
        participantName,
        paymentAmount,
        paymentCurrency,
        paymentType: 'Паевой взнос по соглашению о ЦПП "Цифровой Кошелёк"',
        coopname,
        paymentUrl: `${config.base_url}`,
      };

      // Отправляем уведомление
      const triggerData: WorkflowTriggerDomainInterface = {
        name: Workflows.NewDepositPaymentRequest.id,
        to: {
          subscriberId: chairman.username,
          email: chairmanEmail,
        },
        payload,
      };

      await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      this.logger.log(
        `Уведомление отправлено председателю ${chairman.username} о новой заявке на паевой взнос от ${participantUsername}`
      );
    } catch (error: any) {
      this.logger.error(`Ошибка при отправке уведомления о новом паевом взносе: ${error.message}`, error.stack);
    }
  }
}
