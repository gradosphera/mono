import { rawProjectSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSetProjectDevelopmentRepositoryUrl'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SetCapitalProjectDevelopmentRepositoryUrlInput!') }, rawProjectSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SetCapitalProjectDevelopmentRepositoryUrlInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
