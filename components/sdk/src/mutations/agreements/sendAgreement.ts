import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'sendAgreement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SendAgreementInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SendAgreementInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
