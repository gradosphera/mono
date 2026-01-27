import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCompleteRegistration'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CompleteCapitalRegistrationInputDTO!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CompleteCapitalRegistrationInputDTO']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
