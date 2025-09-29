import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'declineAgreement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeclineAgreementInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeclineAgreementInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
