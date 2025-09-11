import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateProjectProperty'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateProjectPropertyInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateProjectPropertyInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
