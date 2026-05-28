import { Notify } from 'quasar';
import { extractGraphQLErrorMessages } from './errors';

/**
 * Canon-тосты платформы. Единый визуал и поведение для всех типов
 * уведомлений: бизнес-успех, бизнес-ошибка, входящий push (Novu).
 *
 * Канон (см. mono-design-system v2 → toast):
 *  - Позиция: правый НИЖНИЙ угол (bottom-right) — не top-right.
 *  - Контейнер: нейтральная поверхность + левая 3px accent-полоска
 *    (positive/negative/warning/info), без «цветной заливки карточки»
 *    (см. UX-spec stop-signals §19.1).
 *  - Иконка слева, заголовок + опциональный sub.
 *  - Закрытие крестиком справа, авто-таймаут.
 *
 * Стилистические override-ы — централизованно в `quasar-canon.css`
 * (.q-notification + .q-notification.bg-*). Здесь только тип + контент.
 */

const POSITION = 'bottom-right' as const;
const TIMEOUT_INFO = 5000;
const TIMEOUT_ERROR = 7000;

const CLOSE_ACTION = {
  icon: 'close',
  color: 'grey-7',
  round: true,
  size: 'sm',
  flat: true,
  handler: (): void => {
    /* dismiss */
  },
};

export function SuccessAlert(
  message: string,
  action?: {
    text?: string;
    icon?: string;
    handler: () => void;
  },
): void {
  const ctaAction = action
    ? {
        ...(action.text ? { label: action.text } : { icon: action.icon || 'launch' }),
        color: 'positive',
        size: 'sm',
        flat: true,
        handler: action.handler,
      }
    : null;

  Notify.create({
    message,
    type: 'positive',
    icon: 'check_circle',
    position: POSITION,
    timeout: TIMEOUT_INFO,
    actions: ctaAction ? [ctaAction, CLOSE_ACTION] : [CLOSE_ACTION],
  });
}

export function FailAlert(error: unknown, text?: string): void {
  let message = extractGraphQLErrorMessages(error);
  message = message.replace('assertion failure with message: ', '');

  Notify.create({
    message: text ? `${text}: ${message}` : message,
    type: 'negative',
    icon: 'error',
    position: POSITION,
    timeout: TIMEOUT_ERROR,
    actions: [CLOSE_ACTION],
  });
}

export function NotifyAlert(title: string, body?: string, avatar?: string): void {
  Notify.create({
    message: title,
    caption: body,
    avatar,
    // Без avatar — нейтральная иконка-колокольчик; это in-app push от Novu.
    icon: avatar ? undefined : 'notifications',
    position: POSITION,
    timeout: TIMEOUT_INFO + 3000,
    actions: [CLOSE_ACTION],
  });
}
