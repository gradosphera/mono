import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'confirmAgreement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ConfirmAgreementInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ConfirmAgreementInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
