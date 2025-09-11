import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalDeleteProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeleteProjectInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeleteProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
