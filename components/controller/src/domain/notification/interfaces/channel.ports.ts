/**
 * Порты каналов доставки Центра уведомлений (DC v3).
 *
 * Worker (эпик 3) берёт строку `notification_outbox` и вызывает порт нужного
 * канала. Порт инкапсулирует провайдер (SMTP / web-push / in-app persist+pubsub)
 * и рендеринг шаблона из каталога `@coopenomics/notifications`. Здесь — только
 * контракты; реализации добавляются в эпике 2.
 *
 * Имя без `I`-префикса — канон портов репозитория (ср. {@link NotificationPort}).
 */

/** Сообщение к доставке по одному каналу (развёрнуто из outbox-строки). */
export interface ChannelMessage {
  /** Кооператив-владелец (federation-инвариант). */
  coopname: string;
  /** Тип уведомления — ключ каталога (шаблон/тексты берутся по нему). */
  workflowId: string;
  /** Адресат. */
  recipient: {
    subscriberId: string;
    email?: string;
    username?: string;
  };
  /** Данные для подстановки в шаблон. */
  payload?: Record<string, unknown>;
}

/** Исход доставки по каналу — пишется в журнал `notification_deliveries`. */
export interface ChannelDeliveryResult {
  /** Канал принял сообщение (SMTP accept / push 201 / in-app persisted). */
  delivered: boolean;
  /** Ответ провайдера: message-id / push-status / error-body. */
  providerResponse?: string;
  /** Текст ошибки при провале (для ретрая/диагностики). */
  error?: string;
}

/** Канал «Почта» (SMTP/nodemailer). */
export interface EmailChannelPort {
  send(message: ChannelMessage): Promise<ChannelDeliveryResult>;
}

/** Канал «In-app» (persist в БД + GraphQL subscription поверх graphql-ws). */
export interface InAppChannelPort {
  send(message: ChannelMessage): Promise<ChannelDeliveryResult>;
}

/** Канал «Веб-пуш» (web-push на endpoint'ы подписок кооператива). */
export interface WebPushChannelPort {
  send(message: ChannelMessage): Promise<ChannelDeliveryResult>;
}

/** DI-токены каналов. */
export const EMAIL_CHANNEL_PORT = Symbol('EmailChannelPort');
export const IN_APP_CHANNEL_PORT = Symbol('InAppChannelPort');
export const WEB_PUSH_CHANNEL_PORT = Symbol('WebPushChannelPort');
