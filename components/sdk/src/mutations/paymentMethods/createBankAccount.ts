import { type paymentMethodModel, paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createBankAccount'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateBankAccountInput!') }, paymentMethodSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateBankAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
