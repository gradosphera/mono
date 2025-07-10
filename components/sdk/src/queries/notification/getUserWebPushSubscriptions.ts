import { rawWebPushSubscriptionSelector } from '../../selectors/notification/webPushSubscriptionSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getUserWebPushSubscriptions'

/**
 * Получить веб-пуш подписки пользователя
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetUserSubscriptionsInput!') }, rawWebPushSubscriptionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetUserSubscriptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
