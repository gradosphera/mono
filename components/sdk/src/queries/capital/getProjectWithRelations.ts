import { projectSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalProjectWithRelations'

/**
 * Получение проекта с полными отношениями по хешу проекта
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetProjectWithRelationsInput!') }, projectSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetProjectWithRelationsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
