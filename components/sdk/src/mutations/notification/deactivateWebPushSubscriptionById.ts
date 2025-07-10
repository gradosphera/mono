import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'deactivateWebPushSubscriptionById'

/**
 * Деактивировать веб-пуш подписку по ID
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeactivateSubscriptionInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeactivateSubscriptionInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
