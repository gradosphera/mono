import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_DATA_PORT, AccountDataPort } from '~/domain/account/ports/account-data.port';
import config from '~/config/config';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import type { PaymentDomainEntity } from '~/domain/gateway/entities/payment-domain.entity';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';
import { Workflows } from '@coopenomics/notifications';

/**
 * Сервис для отправки уведомлений о статусе платежей
 */
@Injectable()
export class PaymentNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_DATA_PORT)
    private readonly accountPort: AccountDataPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(PaymentNotificationService.name);
  }

  async onModuleInit() {
    this.logger.log('PaymentNotificationService инициализирован');
  }

  /**
   * Отправить уведомление о статусе платежа
   */
  async notifyPaymentStatus(payment: PaymentDomainEntity): Promise<void> {
    try {
      // Отправляем уведомления только для оплаченных и отмененных платежей
      if (payment.status !== PaymentStatusEnum.PAID && payment.status !== PaymentStatusEnum.CANCELLED) {
        return;
      }

      this.logger.debug(`Отправка уведомления о платеже ${payment.id} со статусом ${payment.status}`);

      // Получаем пользователя через порт
      const user = await this.accountPort.getAccount(payment.username);
      const userEmail = user.provider_account?.email;
      if (!userEmail) {
        this.logger.warn(`Email пользователя ${payment.username} не найден`);
        return;
      }

      // Получаем отображаемое имя пользователя
      const userName = await this.accountPort.getDisplayName(payment.username);

      // Выбираем workflow в зависимости от статуса платежа
      const workflowId =
        payment.status === PaymentStatusEnum.PAID ? Workflows.PaymentPaid.id : Workflows.PaymentCancelled.id;

      // Формируем данные для workflow (без приватных данных)
      const payload: Workflows.PaymentPaid.IPayload | Workflows.PaymentCancelled.IPayload = {
        userName,
        paymentAmount: payment.quantity.toFixed(2),
        paymentCurrency: payment.symbol,
        paymentDate: payment.created_at.toLocaleString('ru-RU'),
        paymentUrl: `${config.base_url}`, //TODO: точную ссылку потом
      };

      // Отправляем уведомление
      const triggerData: WorkflowTriggerDomainInterface = {
        name: workflowId,
        to: {
          subscriberId: payment.username,
          email: userEmail,
        },
        payload,
      };

      await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      this.logger.log(
        `Уведомление отправлено пользователю ${payment.username} о статусе платежа ${payment.id} (${payment.status})`
      );
    } catch (error: any) {
      this.logger.error(`Ошибка при отправке уведомления о платеже: ${error.message}`, error.stack);
    }
  }
}
