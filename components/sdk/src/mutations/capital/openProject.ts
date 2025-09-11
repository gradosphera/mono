import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalOpenProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'OpenProjectInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['OpenProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
