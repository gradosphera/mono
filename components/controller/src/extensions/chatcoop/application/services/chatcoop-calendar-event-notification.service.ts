import { Inject, Injectable } from '@nestjs/common';
import type {
  InterCoopCalendarEventNotificationInput,
  InterCoopCalendarEventNotificationPort,
} from '@coopenomics/inter';
import { Workflows } from '@coopenomics/notifications';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { ACCOUNT_DATA_PORT, AccountDataPort } from '~/domain/account/ports/account-data.port';
import { NOVU_WORKFLOW_PORT, NovuWorkflowPort } from '~/domain/notification/interfaces/novu-workflow.port';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import config from '~/config/config';
import { DateUtils } from '~/shared/utils/date-utils';
import { isEligibleForParticipantMassNotification } from '~/domain/account/utils/participant-mass-notification.util';

type CalendarNovuRecipient = { username: string; email: string; subscriberId: string };

/**
 * Реализация {@link InterCoopCalendarEventNotificationPort}: Novu-воркфлоу всем пайщикам с email и subscriber_id (как в остальной системе).
 */
@Injectable()
export class ChatcoopCalendarEventNotificationService implements InterCoopCalendarEventNotificationPort {
  private coopShortName: string | null = null;

  constructor(
    @Inject(NOVU_WORKFLOW_PORT) private readonly novuWorkflowPort: NovuWorkflowPort,
    @Inject(ACCOUNT_DATA_PORT) private readonly accountPort: AccountDataPort,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ChatcoopCalendarEventNotificationService.name);
  }

  private getTimezoneLabel(): string {
    return config.timezone === 'Europe/Moscow' ? 'Мск' : config.timezone;
  }

  private async getCoopShortName(): Promise<string> {
    if (this.coopShortName) {
      return this.coopShortName;
    }
    const account = await this.accountPort.getAccount(config.coopname);
    const shortName = account.private_account?.organization_data?.short_name;
    this.coopShortName = shortName ?? config.coopname;
    return this.coopShortName;
  }

  private formatEndParts(endsAt: Date | null): { endDate: string; endTime: string } {
    if (!endsAt) {
      return { endDate: 'не указано', endTime: 'не указано' };
    }
    return {
      endDate: DateUtils.formatLocalDate(endsAt),
      endTime: DateUtils.formatLocalTime(endsAt),
    };
  }

  private async getCalendarNovuRecipients(): Promise<CalendarNovuRecipient[]> {
    const batchSize = 100;
    let currentPage = 1;
    let hasMorePages = true;
    const allAccounts: CalendarNovuRecipient[] = [];

    while (hasMorePages) {
      const accountsPage = await this.accountPort.getAccounts(
        {},
        { page: currentPage, limit: batchSize, sortOrder: 'DESC' }
      );

      const mappings = accountsPage.items
        .filter(isEligibleForParticipantMassNotification)
        .map((account) => ({
          username: account.username,
          email: account.provider_account?.email?.trim() ?? '',
          subscriberId: account.provider_account?.subscriber_id?.trim() ?? '',
        }))
        .filter((m): m is CalendarNovuRecipient => m.email.includes('@') && m.subscriberId !== '');

      allAccounts.push(...mappings);

      if (accountsPage.currentPage >= accountsPage.totalPages || accountsPage.items.length === 0) {
        hasMorePages = false;
      } else {
        currentPage++;
      }
    }

    return allAccounts;
  }

  private buildPayload(input: InterCoopCalendarEventNotificationInput, coopShortName: string) {
    const { endDate, endTime } = this.formatEndParts(input.endsAt);
    const trimmed = input.description?.trim();
    const base = {
      coopShortName,
      title: input.title,
      startDate: DateUtils.formatLocalDate(input.startsAt),
      startTime: DateUtils.formatLocalTime(input.startsAt),
      endDate,
      endTime,
      timezone: this.getTimezoneLabel(),
      roomLabel: input.roomDisplayLabel,
      eventUrl: input.eventUrl,
      actorUsername: input.actorUsername,
    };
    return trimmed ? { ...base, description: trimmed } : base;
  }

  private async dispatchWorkflow(
    workflowId: string,
    input: InterCoopCalendarEventNotificationInput
  ): Promise<void> {
    const users = await this.getCalendarNovuRecipients();
    if (users.length === 0) {
      this.logger.warn(
        'Нет подходящих пайщиков (active/registered + email + subscriber_id) — уведомления календаря не отправлены'
      );
      return;
    }

    const coopShortName = await this.getCoopShortName();
    const payload = this.buildPayload(input, coopShortName);

    let sent = 0;
    for (const user of users) {
      const triggerData: WorkflowTriggerDomainInterface = {
        name: workflowId,
        to: { subscriberId: user.subscriberId, email: user.email },
        payload,
      };
      try {
        await this.novuWorkflowPort.triggerWorkflow(triggerData);
        sent++;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Ошибка Novu календаря для ${user.username}: ${message}`);
      }
    }

    this.logger.log(`Календарь Novu (${workflowId}): отправлено ${sent}/${users.length}`);
  }

  async notifyEventCreated(input: InterCoopCalendarEventNotificationInput): Promise<void> {
    try {
      await this.dispatchWorkflow(Workflows.ChatCoopCalendarEventCreated.id, input);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`notifyEventCreated: ${message}`);
    }
  }

  async notifyEventUpdated(input: InterCoopCalendarEventNotificationInput): Promise<void> {
    try {
      await this.dispatchWorkflow(Workflows.ChatCoopCalendarEventUpdated.id, input);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`notifyEventUpdated: ${message}`);
    }
  }
}
