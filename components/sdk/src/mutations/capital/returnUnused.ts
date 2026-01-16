import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalReturnUnused'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ReturnUnusedInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ReturnUnusedInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
