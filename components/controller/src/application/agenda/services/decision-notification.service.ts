import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_EXTENSION_PORT, AccountExtensionPort } from '~/domain/extension/ports/account-extension-port';
import config from '~/config/config';
import { SovietContract } from 'cooptypes';
import type { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import { Workflows } from '@coopenomics/notifications';

/**
 * Сервис для отправки уведомлений о принятых решениях совета
 *
 * Подписывается на действие soviet::newdecision и отправляет уведомление
 * пользователю о принятии решения по его вопросу
 */
@Injectable()
export class DecisionNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_EXTENSION_PORT)
    private readonly accountPort: AccountExtensionPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(DecisionNotificationService.name);
  }

  async onModuleInit() {
    this.logger.log('DecisionNotificationService инициализирован');
  }

  /**
   * Обработчик действия soviet::newdecision
   * Отправляет уведомление пользователю о принятии решения совета по его вопросу
   */
  @OnEvent(`action::${SovietContract.contractName.production}::newdecision`)
  async handleNewDecision(actionData: ActionDomainInterface): Promise<void> {
    try {
      const action = actionData.data as any;

      // Проверяем что это наш кооператив
      if (action.coopname !== config.coopname) {
        return;
      }

      this.logger.debug(`Обработка нового решения совета: ${action.decision_id}`);

      // Получаем username из действия
      const username = action.username;
      if (!username) {
        this.logger.warn(`Username не найден в действии ${action.decision_id}`);
        return;
      }

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
      const payload: Workflows.DecisionApproved.IPayload = {
        userName,
        decisionTitle: `Решение №${action.decision_id}`,
        coopname: action.coopname,
        decision_id: action.decision_id,
        decisionUrl: `${config.base_url}/${action.coopname}/user/decisions/${action.decision_id}`,
      };

      // Отправляем уведомление
      const triggerData: WorkflowTriggerDomainInterface = {
        name: Workflows.DecisionApproved.id,
        to: {
          subscriberId: username,
          email: userEmail,
        },
        payload,
      };

      await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      this.logger.log(`Уведомление отправлено пользователю ${username} о принятии решения ${action.decision_id}`);
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке нового решения совета: ${error.message}`, error.stack);
    }
  }
}
