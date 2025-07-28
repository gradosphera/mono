import { rawSubscriptionStatsSelector } from '../../selectors/notification/subscriptionStatsSelector'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getWebPushSubscriptionStats'

/**
 * Получить статистику веб-пуш подписок (только для председателя)
 */
export const query = Selector('Query')({
  [name]: rawSubscriptionStatsSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
