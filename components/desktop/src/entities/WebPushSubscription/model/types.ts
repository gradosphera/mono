import type { Queries, Mutations } from '@coopenomics/sdk';

/**
 * Типы данных для веб-пуш подписок из SDK
 */
export type IWebPushSubscription =
  Queries.Notification.GetUserWebPushSubscriptions.IOutput[typeof Queries.Notification.GetUserWebPushSubscriptions.name][number];
export type ISubscriptionStats =
  Queries.Notification.GetWebPushSubscriptionStats.IOutput[typeof Queries.Notification.GetWebPushSubscriptionStats.name];
export type ICreateSubscriptionResponse =
  Mutations.Notification.CreateWebPushSubscription.IOutput[typeof Mutations.Notification.CreateWebPushSubscription.name];

// Входные типы
export type IGetUserSubscriptionsInput =
  Queries.Notification.GetUserWebPushSubscriptions.IInput['data'];
export type ICreateWebPushSubscriptionInput =
  Mutations.Notification.CreateWebPushSubscription.IInput['data'];
export type IDeactivateSubscriptionInput =
  Mutations.Notification.DeactivateWebPushSubscriptionById.IInput['data'];

/**
 * Состояние поддержки push уведомлений браузером
 */
export interface IPushNotificationSupport {
  isSupported: boolean;
  hasPermission: boolean;
  permission: NotificationPermission;
  hasServiceWorker: boolean;
  canSubscribe: boolean;
  error?: string;
}

/**
 * Данные для создания подписки
 */
export interface ICreateSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
}

/**
 * Состояние подписки пользователя
 */
export interface ISubscriptionState {
  isSubscribed: boolean;
  subscription: IWebPushSubscription | null;
  isLoading: boolean;
  error: string | null;
  support: IPushNotificationSupport;
}
