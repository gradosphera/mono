import { projectSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalProject'

/**
 * Получение проекта по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetProjectInput!') }, projectSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
