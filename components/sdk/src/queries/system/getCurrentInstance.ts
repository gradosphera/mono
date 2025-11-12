import { currentInstanceSelector } from '../../selectors/system/currentInstanceSelector'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getCurrentInstance'

/**
 * Извлекает текущий инстанс авторизованного пользователя
 */
export const query = Selector('Query')({
  [name]: currentInstanceSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
