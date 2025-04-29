import { systemInfoSelector } from '../../selectors/system/systemInfoSelector'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'getSystemInfo'

/**
 * Извлекает информацию о состоянии системы
 */
export const query = Selector('Query')({
  [name]: systemInfoSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
