import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateProgramProperty'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateProgramPropertyInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateProgramPropertyInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
