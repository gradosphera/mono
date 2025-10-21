import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_EXTENSION_PORT, AccountExtensionPort } from '~/domain/extension/ports/account-extension-port';
import config from '~/config/config';
import { SovietContract } from 'cooptypes';
import type { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import type {
  WorkflowBulkTriggerDomainInterface,
  WorkflowBulkEventDomainInterface,
} from '~/domain/notification/interfaces/workflow-trigger-domain.interface';

/**
 * Сервис для отправки уведомлений о новых вопросах на повестке совета
 *
 * Подписывается на действие soviet::createagenda и отправляет уведомления
 * всем членам совета о новом вопросе
 */
@Injectable()
export class AgendaNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_EXTENSION_PORT)
    private readonly accountPort: AccountExtensionPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(AgendaNotificationService.name);
  }

  async onModuleInit() {
    this.logger.log('AgendaNotificationService инициализирован');
  }

  /**
   * Обработчик действия soviet::createagenda
   * Отправляет уведомления всем членам совета о новом вопросе на повестке
   */
  @OnEvent(`action::${SovietContract.contractName.production}::createagenda`)
  async handleCreateAgenda(actionData: ActionDomainInterface): Promise<void> {
    try {
      const action = actionData.data as any;

      // Проверяем что это наш кооператив
      if (action.coopname !== config.coopname) {
        return;
      }

      this.logger.debug(`Обработка создания нового вопроса на повестке для решения ${action.decision_id}`);

      // Получаем членов совета (chairman и member) через порт
      // Получаем председателей
      const chairmen = await this.accountPort.getAccounts({ role: 'chairman' }, { page: 1, limit: 10, sortOrder: 'ASC' });
      // Получаем членов
      const members = await this.accountPort.getAccounts({ role: 'member' }, { page: 1, limit: 100, sortOrder: 'ASC' });

      const allCouncilMembers = [...chairmen.items, ...members.items];

      if (allCouncilMembers.length === 0) {
        this.logger.warn('Члены совета не найдены, пропускаем отправку уведомлений');
        return;
      }

      // Получаем кооператив для получения short_name
      const coop = await this.accountPort.getAccount(config.coopname);
      const coopShortName = coop.private_account?.organization_data?.short_name || config.coopname;

      // Получаем отображаемое имя автора вопроса
      const authorName = await this.accountPort.getDisplayName(action.username);

      // Формируем данные для workflow
      const payload = {
        coopname: action.coopname,
        coopShortName,
        itemTitle: `Вопрос №${action.decision_id}`,
        itemDescription: `Новый вопрос добавлен на повестку заседания совета`,
        authorName,
        decision_id: action.decision_id,
        agendaUrl: `${config.base_url}/${action.coopname}/council/agenda`,
      };

      // Подготавливаем события для пакетной отправки
      const events: WorkflowBulkEventDomainInterface[] = [];

      for (const member of allCouncilMembers) {
        const memberEmail = member.provider_account?.email;
        if (!memberEmail) {
          this.logger.warn(`Email члена совета ${member.username} не найден, пропускаем`);
          continue;
        }

        events.push({
          to: {
            subscriberId: member.username,
            email: memberEmail,
          },
          payload,
        });
      }

      if (events.length === 0) {
        this.logger.warn('Нет подходящих получателей для уведомления');
        return;
      }

      // Отправляем уведомления пакетом
      const bulkTriggerData: WorkflowBulkTriggerDomainInterface = {
        name: 'noviy-vopros-na-povestke',
        events,
      };

      await this.novuWorkflowAdapter.triggerBulkWorkflow(bulkTriggerData);
      this.logger.log(
        `Уведомления отправлены ${events.length} членам совета о новом вопросе на повестке (решение ${action.decision_id})`
      );
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке создания вопроса на повестке: ${error.message}`, error.stack);
    }
  }
}
