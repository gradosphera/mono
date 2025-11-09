import { providerSubscriptionSelector } from '../../selectors/system/providerSubscriptionSelector'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getProviderSubscriptions'

/**
 * Извлекает подписки пользователя у провайдера
 */
export const query = Selector('Query')({
  [name]: providerSubscriptionSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
