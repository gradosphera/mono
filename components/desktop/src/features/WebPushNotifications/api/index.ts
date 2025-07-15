import { Mutations } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';
import type {
  ICreateSubscriptionResponse,
  ICreateSubscriptionData,
  ICreateWebPushSubscriptionInput,
  IDeactivateSubscriptionInput,
} from 'src/entities/WebPushSubscription';

/**
 * Создание веб-пуш подписки
 */
async function createWebPushSubscription(
  subscriptionData: ICreateSubscriptionData,
  username: string,
): Promise<ICreateSubscriptionResponse> {
  const data: ICreateWebPushSubscriptionInput = {
    username: username,
    subscription: {
      endpoint: subscriptionData.endpoint,
      keys: {
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
      },
    },
    userAgent: subscriptionData.userAgent,
  };

  const { [Mutations.Notification.CreateWebPushSubscription.name]: result } =
    await client.Mutation(
      Mutations.Notification.CreateWebPushSubscription.mutation,
      {
        variables: {
          data,
        },
      },
    );

  return result;
}

/**
 * Деактивация подписки по ID
 */
async function deactivateWebPushSubscription(
  subscriptionId: string,
): Promise<boolean> {
  const data: IDeactivateSubscriptionInput = {
    subscriptionId,
  };

  const {
    [Mutations.Notification.DeactivateWebPushSubscriptionById.name]: result,
  } = await client.Mutation(
    Mutations.Notification.DeactivateWebPushSubscriptionById.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const webPushNotificationsMutations = {
  createWebPushSubscription,
  deactivateWebPushSubscription,
};
