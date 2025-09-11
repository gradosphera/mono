import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateProjectInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
