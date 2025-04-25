import { paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'updateBankAccount'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UpdateBankAccountInput!') }, paymentMethodSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UpdateBankAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
