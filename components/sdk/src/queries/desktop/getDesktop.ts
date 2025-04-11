import { desktopSelector } from '../../selectors/desktop'
import { extensionSelector } from '../../selectors/extensions/extensionSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getDesktop'

/**
 * Извлекает рабочий стол
 */
export const query = Selector('Query')({
  [name]: desktopSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
