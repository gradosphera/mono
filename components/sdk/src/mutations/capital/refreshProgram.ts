import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalRefreshProgram'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'RefreshProgramInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['RefreshProgramInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
