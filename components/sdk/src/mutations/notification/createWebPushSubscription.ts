import { rawCreateSubscriptionResponseSelector } from '../../selectors/notification/createSubscriptionResponseSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createWebPushSubscription'

/**
 * Создать веб-пуш подписку для пользователя
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateSubscriptionInput!') }, rawCreateSubscriptionResponseSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateSubscriptionInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
