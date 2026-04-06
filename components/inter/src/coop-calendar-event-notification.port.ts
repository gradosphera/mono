/**
 * Оповещения пайщиков о событиях кооперативного календаря (Novu / стол связи).
 * Реализация — ChatcoopCalendarEventNotificationService; токен INTER_COOP_CALENDAR_EVENT_NOTIFICATION в ChatCoopPluginModule.
 */
export interface InterCoopCalendarEventNotificationInput {
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  roomDisplayLabel: string;
  eventUrl: string;
  /** Имя пользователя, создавшего или изменившего событие */
  actorUsername: string;
}

export interface InterCoopCalendarEventNotificationPort {
  notifyEventCreated(input: InterCoopCalendarEventNotificationInput): Promise<void>;

  notifyEventUpdated(input: InterCoopCalendarEventNotificationInput): Promise<void>;
}
