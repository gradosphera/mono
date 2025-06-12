import { Inject, Injectable } from '@nestjs/common';
import { sendEmail } from '~/services/email.service';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import { DateUtils } from '~/shared/utils/date-utils';
import { default as config } from '~/config/config';
import { TrackedMeet, NotificationTypes, ILog } from './types';
import {
  LOG_EXTENSION_REPOSITORY,
  LogExtensionDomainRepository,
} from '~/domain/extension/repositories/log-extension-domain.repository';
import { ExtendedMeetStatus } from '~/domain/meet/enums/extended-meet-status.enum';

@Injectable()
export class NotificationSenderService {
  constructor(
    private readonly logger: WinstonLoggerService,
    @Inject(LOG_EXTENSION_REPOSITORY) private readonly logExtensionRepository: LogExtensionDomainRepository<ILog>
  ) {
    this.logger.setContext(NotificationSenderService.name);
  }

  // Сервисное имя для логирования
  private readonly extensionName = 'participant';

  // Функция для получения адресов - будет заменена на реальную в ParticipantPlugin
  private _getUserEmailsFunction: (() => Promise<string[]>) | null = null;

  // Установка функции для получения email адресов
  setGetUserEmailsFunction(func: () => Promise<string[]>): void {
    this._getUserEmailsFunction = func;
  }

  // Получение всех email-адресов пользователей через функцию
  private async getAllUserEmails(): Promise<string[]> {
    if (!this._getUserEmailsFunction) {
      this.logger.warn('Функция получения email адресов не установлена');
      return [];
    }
    try {
      return await this._getUserEmailsFunction();
    } catch (error: any) {
      this.logger.error(`Ошибка при получении email пользователей: ${error.message}`, error.stack);
      return [];
    }
  }

  // Логирование отправки уведомлений
  private async logNotification(meetHash: string, notificationType: string, recipients: number) {
    await this.logExtensionRepository.push(this.extensionName, {
      type: 'notification',
      meetHash,
      notificationType,
      recipients,
      timestamp: new Date().toISOString(),
    });
  }

  // Формирование URL для уведомлений
  private getNotificationUrl(meet: TrackedMeet): string {
    return `${config.base_url}/${meet.coopname}/user/meets/${meet.hash.toUpperCase()}`;
  }

  // Форматирование сообщения о часовом поясе
  private getTimezoneDisplay(): string {
    return config.timezone === 'Europe/Moscow' ? 'МСК' : config.timezone;
  }

  // Функции отправки уведомлений

  // 1. Начальное уведомление при появлении собрания в статусе WAITING_FOR_OPENING
  async sendInitialNotification(meet: TrackedMeet): Promise<void> {
    const emails = await this.getAllUserEmails();
    if (emails.length === 0) return;

    const meetDate = DateUtils.formatLocalDate(meet.open_at);
    const meetTime = DateUtils.formatLocalTime(meet.open_at);
    const meetEndDate = DateUtils.formatLocalDate(meet.close_at);
    const meetEndTime = DateUtils.formatLocalTime(meet.close_at);
    const timezone = this.getTimezoneDisplay();

    const subject = `Уведомление о общем собрании пайщиков №${meet.id}`;
    const notificationUrl = this.getNotificationUrl(meet);

    const text = `Уважаемый пайщик!

В кооперативе объявлено новое общее собрание №${meet.id}.

Дата и время начала: ${meetDate} в ${meetTime} (${timezone})
Дата и время завершения: ${meetEndDate} в ${meetEndTime} (${timezone})

Для ознакомления с повесткой, пожалуйста, перейдите по ссылке:
${notificationUrl}

С уважением, Совет.`;

    for (const email of emails) {
      await sendEmail(email, subject, text);
    }

    this.logger.info(
      `Отправлено начальное уведомление о собрании ${meet.hash} (№${meet.id}) для ${emails.length} пользователей`
    );
    await this.logNotification(meet.hash, NotificationTypes.INITIAL, emails.length);
  }

  // 2. Уведомление за N дней до начала собрания
  async sendThreeDaysBeforeStartNotification(meet: TrackedMeet): Promise<void> {
    const emails = await this.getAllUserEmails();
    if (emails.length === 0) return;

    const meetDate = DateUtils.formatLocalDate(meet.open_at);
    const meetTime = DateUtils.formatLocalTime(meet.open_at);

    // Рассчитываем реальную разницу между текущим временем и временем начала собрания с учетом часового пояса
    const now = new Date();
    const openAtDate = DateUtils.convertUtcToLocalTime(meet.open_at);
    const diffMinutes = Math.floor((openAtDate.getTime() - now.getTime()) / (1000 * 60));
    const timeDescription = DateUtils.formatDurationHumanizeRu(diffMinutes);

    const subject = `Напоминание о предстоящем общем собрании №${meet.id}`;
    const notificationUrl = this.getNotificationUrl(meet);

    const text = `Уважаемый пайщик!

Напоминаем, что ${timeDescription} состоится общее собрание пайщиков №${meet.id} (${meetDate} в ${meetTime}).

Для ознакомления с повесткой и подписи уведомления, пожалуйста, перейдите по ссылке:
${notificationUrl}

С уважением, Совет.`;

    for (const email of emails) {
      await sendEmail(email, subject, text);
    }

    this.logger.info(
      `Отправлено уведомление за ${timeDescription} до начала собрания ${meet.hash} (№${meet.id}) для ${emails.length} пользователей`
    );
    await this.logNotification(meet.hash, NotificationTypes.THREE_DAYS_BEFORE_START, emails.length);
  }

  // 3. Уведомление о начале собрания (при переходе в статус VOTING_IN_PROGRESS)
  async sendStartNotification(meet: TrackedMeet): Promise<void> {
    const emails = await this.getAllUserEmails();
    if (emails.length === 0) return;

    const meetEndDate = DateUtils.formatLocalDate(meet.close_at);
    const meetEndTime = DateUtils.formatLocalTime(meet.close_at);
    const timezone = this.getTimezoneDisplay();

    const subject = `Собрание пайщиков №${meet.id} началось`;
    const notificationUrl = this.getNotificationUrl(meet);

    const text = `Уважаемый пайщик!

Сегодня началось общее собрание пайщиков №${meet.id}.
Собрание будет проходить до ${meetEndDate} ${meetEndTime} (${timezone}).

Просим принять участие в голосовании по вопросам повестки дня.
Для голосования перейдите по ссылке:
${notificationUrl}

С уважением, Совет.`;

    for (const email of emails) {
      await sendEmail(email, subject, text);
    }

    this.logger.info(
      `Отправлено уведомление о начале собрания ${meet.hash} (№${meet.id}) для ${emails.length} пользователей`
    );
    await this.logNotification(meet.hash, NotificationTypes.START, emails.length);
  }

  // 4. Уведомление за N дней до окончания собрания
  async sendOneDayBeforeEndNotification(meet: TrackedMeet): Promise<void> {
    const emails = await this.getAllUserEmails();
    if (emails.length === 0) return;

    const meetEndDate = DateUtils.formatLocalDate(meet.close_at);
    const meetEndTime = DateUtils.formatLocalTime(meet.close_at);

    // Рассчитываем реальную разницу между текущим временем и временем окончания собрания с учетом часового пояса
    const now = new Date();
    const closeAtDate = DateUtils.convertUtcToLocalTime(meet.close_at);
    const diffMinutes = Math.floor((closeAtDate.getTime() - now.getTime()) / (1000 * 60));
    const timeDescription = DateUtils.formatDurationHumanizeRu(diffMinutes);

    const timezone = this.getTimezoneDisplay();

    const subject = `Напоминание о завершении собрания пайщиков №${meet.id}`;
    const notificationUrl = this.getNotificationUrl(meet);

    const text = `Уважаемый пайщик!

Общее собрание №${meet.id} завершится ${timeDescription} (${meetEndDate} в ${meetEndTime} ${timezone}).

Если вы еще не проголосовали, пожалуйста, примите участие в голосовании по вопросам повестки дня.
Для голосования перейдите по ссылке:
${notificationUrl}

С уважением, Совет.`;

    for (const email of emails) {
      await sendEmail(email, subject, text);
    }

    this.logger.info(
      `Отправлено уведомление за ${timeDescription} до завершения собрания ${meet.hash} (№${meet.id}) для ${emails.length} пользователей`
    );
    await this.logNotification(meet.hash, NotificationTypes.ONE_DAY_BEFORE_END, emails.length);
  }

  // 5. Уведомление о назначении новой даты для повторного собрания
  async sendRestartNotification(meet: TrackedMeet): Promise<void> {
    const emails = await this.getAllUserEmails();
    if (emails.length === 0) return;

    const meetDate = DateUtils.formatLocalDate(meet.open_at);
    const meetTime = DateUtils.formatLocalTime(meet.open_at);
    const meetEndDate = DateUtils.formatLocalDate(meet.close_at);
    const meetEndTime = DateUtils.formatLocalTime(meet.close_at);
    const timezone = this.getTimezoneDisplay();

    const subject = `Назначена новая дата повторного собрания №${meet.id}`;
    const notificationUrl = this.getNotificationUrl(meet);

    const text = `Уважаемый пайщик!

Назначена новая дата проведения повторного собрания №${meet.id}.

Дата и время начала: ${meetDate} в ${meetTime} (${timezone})
Дата и время завершения: ${meetEndDate} в ${meetEndTime} (${timezone})

Повестка собрания остается прежней.
Для ознакомления с повесткой и подписи уведомления, пожалуйста, перейдите по ссылке:
${notificationUrl}

С уважением, Совет.`;

    for (const email of emails) {
      await sendEmail(email, subject, text);
    }

    this.logger.info(
      `Отправлено уведомление о новой дате повторного собрания ${meet.hash} (№${meet.id}) для ${emails.length} пользователей`
    );
    await this.logNotification(meet.hash, NotificationTypes.RESTART, emails.length);
  }

  // 6. Уведомление о разных вариантах завершения собрания
  async sendEndNotification(meet: TrackedMeet): Promise<void> {
    const emails = await this.getAllUserEmails();
    if (emails.length === 0) return;

    const notificationUrl = this.getNotificationUrl(meet);
    let subject = '';
    let text = '';

    switch (meet.extendedStatus) {
      case ExtendedMeetStatus.EXPIRED_NO_QUORUM:
        subject = `Кворум общего собрания №${meet.id} не собран`;
        text = `Уважаемый пайщик!

Кворум общего собрания №${meet.id} не собран. В ближайшее время будет назначена новая дата собрания с прежней повесткой.

Следите за обновлениями.

С уважением, Совет.`;
        break;

      case ExtendedMeetStatus.VOTING_COMPLETED:
        subject = `Голосование по собранию №${meet.id} завершено`;
        text = `Уважаемый пайщик!

Голосование по собранию №${meet.id} завершено. Ожидаем утверждения протокола собрания советом.

Для просмотра результатов голосования перейдите по ссылке:
${notificationUrl}

С уважением, Совет.`;
        break;

      case ExtendedMeetStatus.CLOSED:
        subject = `Общее собрание №${meet.id} завершено`;
        text = `Уважаемый пайщик!

Общее собрание пайщиков №${meet.id} успешно завершено. Протокол собрания утвержден.

Для просмотра результатов собрания перейдите по ссылке:
${notificationUrl}

С уважением, Совет.`;
        break;
    }

    if (!subject || !text) {
      this.logger.warn(`Неподдерживаемый статус для отправки уведомления о завершении: ${meet.extendedStatus}`);
      return;
    }

    for (const email of emails) {
      await sendEmail(email, subject, text);
    }

    this.logger.info(
      `Отправлено уведомление о завершении собрания ${meet.hash} (№${meet.id}) для ${emails.length} пользователей`
    );
    await this.logNotification(meet.hash, NotificationTypes.END, emails.length);
  }
}
