import { Queries } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';
import type {
  IWebPushSubscription,
  ISubscriptionStats,
  IGetUserSubscriptionsInput,
} from '../model/types';

/**
 * Получение подписок пользователя
 */
async function getUserWebPushSubscriptions(
  data: IGetUserSubscriptionsInput,
): Promise<IWebPushSubscription[]> {
  const { [Queries.Notification.GetUserWebPushSubscriptions.name]: result } =
    await client.Query(Queries.Notification.GetUserWebPushSubscriptions.query, {
      variables: {
        data,
      },
    });

  return result;
}

/**
 * Получение статистики подписок (только для председателя)
 */
async function getWebPushSubscriptionStats(): Promise<ISubscriptionStats> {
  const { [Queries.Notification.GetWebPushSubscriptionStats.name]: result } =
    await client.Query(Queries.Notification.GetWebPushSubscriptionStats.query, {
      variables: {},
    });

  return result;
}

export const webPushSubscriptionApi = {
  getUserWebPushSubscriptions,
  getWebPushSubscriptionStats,
};
