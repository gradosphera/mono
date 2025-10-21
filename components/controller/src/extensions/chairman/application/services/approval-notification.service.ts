import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import { ACCOUNT_EXTENSION_PORT, AccountExtensionPort } from '~/domain/extension/ports/account-extension-port';
import type { IDelta } from '~/types/common';
import config from '~/config/config';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';

/**
 * Сервис для отправки уведомлений по одобрениям председателя
 *
 * Подписывается на дельты таблицы approvals и отправляет уведомления председателю
 * когда создается новый запрос на одобрение
 */
@Injectable()
export class ApprovalNotificationService implements OnModuleInit {
  constructor(
    @Inject(NOVU_WORKFLOW_PORT)
    private readonly novuWorkflowAdapter: NovuWorkflowAdapter,
    @Inject(ACCOUNT_EXTENSION_PORT)
    private readonly accountPort: AccountExtensionPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ApprovalNotificationService.name);
  }

  async onModuleInit() {
    this.logger.log('ApprovalNotificationService инициализирован');
  }

  /**
   * Обработчик дельт таблицы approvals
   * Отправляет уведомление председателю о новом запросе на одобрение
   */
  @OnEvent('delta::soviet::approvals')
  async handleApprovalDelta(delta: IDelta): Promise<void> {
    try {
      // Проверяем что это новая запись (present = true и это не обновление)
      if (!delta.present) {
        return;
      }

      const approvalData = delta.value as any;

      // Проверяем что это наш кооператив
      if (approvalData.coopname !== config.coopname) {
        return;
      }

      this.logger.debug(`Обработка нового одобрения: ${approvalData.approval_hash}`);

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

      // Получаем отображаемое имя председателя
      const chairmanName = await this.accountPort.getDisplayName(chairman.username);

      // Получаем отображаемое имя автора запроса
      const authorName = await this.accountPort.getDisplayName(approvalData.username);

      // Формируем данные для workflow
      const payload = {
        chairmanName,
        requestTitle: this.extractTitleFromMeta(approvalData.meta),
        requestDescription: this.extractDescriptionFromMeta(approvalData.meta),
        authorName,
        coopname: approvalData.coopname,
        approval_hash: approvalData.approval_hash,
        approvalUrl: `${config.base_url}/${approvalData.coopname}/chairman/approvals`,
      };

      // Отправляем уведомление
      const triggerData: WorkflowTriggerDomainInterface = {
        name: 'zapros-na-odobrenie-predsedatelya',
        to: {
          subscriberId: chairman.username,
          email: chairmanEmail,
        },
        payload,
      };

      await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      this.logger.log(
        `Уведомление отправлено председателю ${chairman.username} о новом одобрении ${approvalData.approval_hash}`
      );
    } catch (error: any) {
      this.logger.error(`Ошибка при обработке дельты одобрения: ${error.message}`, error.stack);
    }
  }

  /**
   * Извлечь заголовок из meta
   */
  private extractTitleFromMeta(meta: string): string {
    try {
      const parsed = JSON.parse(meta);
      return parsed.title || 'Новый запрос на одобрение';
    } catch (e) {
      return 'Новый запрос на одобрение';
    }
  }

  /**
   * Извлечь описание из meta
   */
  private extractDescriptionFromMeta(meta: string): string {
    try {
      const parsed = JSON.parse(meta);
      return parsed.description || '';
    } catch (e) {
      return '';
    }
  }
}
