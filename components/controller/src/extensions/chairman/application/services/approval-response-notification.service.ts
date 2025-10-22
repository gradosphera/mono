import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_EXTENSION_PORT, AccountExtensionPort } from '~/domain/extension/ports/account-extension-port';
import config from '~/config/config';
import type { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import { Workflows } from '@coopenomics/notifications';
import { SovietContract } from 'cooptypes';
import { ApprovalRepository, APPROVAL_REPOSITORY } from '../../domain/repositories/approval.repository';

/**
 * Сервис для отправки уведомлений об ответах на запросы одобрения
 *
 * Подписывается на действия soviet::confirmapprv и soviet::declineapprv
 * и отправляет уведомления авторам запросов об одобрении или отклонении
 */
@Injectable()
export class ApprovalResponseNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_EXTENSION_PORT)
    private readonly accountPort: AccountExtensionPort,
    @Inject(APPROVAL_REPOSITORY)
    private readonly approvalRepository: ApprovalRepository,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ApprovalResponseNotificationService.name);
  }

  async onModuleInit() {
    this.logger.log('ApprovalResponseNotificationService инициализирован');
  }

  /**
   * Обработчик действия soviet::confirmapprv (подтверждение одобрения)
   * Отправляет уведомление автору запроса об одобрении
   */
  @OnEvent(`action::${SovietContract.contractName.production}::${SovietContract.Actions.Approves.ConfirmApprove.actionName}`)
  async handleConfirmApprove(actionData: ActionDomainInterface): Promise<void> {
    try {
      const action = actionData.data as SovietContract.Actions.Approves.ConfirmApprove.IConfirmApprove;

      // Проверяем что это наш кооператив
      if (action.coopname !== config.coopname) {
        return;
      }

      this.logger.debug(`Обработка подтверждения одобрения для хеша: ${action.approval_hash}`);

      await this.sendApprovalResponseNotification(action.approval_hash, 'approved');
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке подтверждения одобрения: ${error.message}`, error.stack);
    }
  }

  /**
   * Обработчик действия soviet::declineapprv (отклонение одобрения)
   * Отправляет уведомление автору запроса об отклонении
   */
  @OnEvent(`action::${SovietContract.contractName.production}::${SovietContract.Actions.Approves.DeclineApprove.actionName}`)
  async handleDeclineApprove(actionData: ActionDomainInterface): Promise<void> {
    try {
      const action = actionData.data as SovietContract.Actions.Approves.DeclineApprove.IDeclineApprove;

      // Проверяем что это наш кооператив
      if (action.coopname !== config.coopname) {
        return;
      }

      this.logger.debug(`Обработка отклонения одобрения для хеша: ${action.approval_hash}`);

      await this.sendApprovalResponseNotification(action.approval_hash, 'declined');
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке отклонения одобрения: ${error.message}`, error.stack);
    }
  }

  /**
   * Отправляет уведомление об ответе на запрос одобрения
   */
  private async sendApprovalResponseNotification(approvalHash: string, status: 'approved' | 'declined'): Promise<void> {
    // Получаем данные одобрения из репозитория
    const approval = await this.approvalRepository.findByApprovalHash(approvalHash);

    if (!approval) {
      this.logger.warn(`Одобрение с хешем ${approvalHash} не найдено`);
      return;
    }

    // Получаем кооператив для получения short_name
    const coop = await this.accountPort.getAccount(config.coopname);
    const coopShortName = coop.private_account?.organization_data?.short_name || config.coopname;

    const authorUsername = approval.username;

    try {
      // Получаем аккаунт автора запроса
      const authorAccount = await this.accountPort.getAccount(authorUsername);
      const authorEmail = authorAccount.provider_account?.email;

      if (!authorEmail) {
        this.logger.warn(`Email автора запроса ${authorUsername} не найден`);
        return;
      }

      // Получаем отображаемое имя автора
      const authorName = await this.accountPort.getDisplayName(authorUsername);

      // Формируем данные для workflow
      const payload: Workflows.ApprovalResponse.IPayload = {
        userName: authorName,
        approvalStatus: status,
        approvalId: approvalHash,
        coopname: config.coopname,
        coopShortName,
        approvalUrl: `${config.base_url}`,
      };

      // Отправляем уведомление
      const triggerData: WorkflowTriggerDomainInterface = {
        name: Workflows.ApprovalResponse.id,
        to: {
          subscriberId: authorUsername,
          email: authorEmail,
        },
        payload,
      };

      await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      this.logger.log(
        `Уведомление отправлено автору ${authorUsername} об ${
          status === 'approved' ? 'одобрении' : 'отклонении'
        } запроса ${approvalHash}`
      );
    } catch (error: any) {
      this.logger.error(`Ошибка при отправке уведомления об ответе на одобрение: ${error.message}`, error.stack);
    }
  }
}
