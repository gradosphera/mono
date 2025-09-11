import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalStartProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'StartProjectInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['StartProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
