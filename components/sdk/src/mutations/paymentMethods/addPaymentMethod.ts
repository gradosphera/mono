import { type paymentMethodModel, paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'addPaymentMethod'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AddPaymentMethodInput!') }, paymentMethodSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AddPaymentMethodInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
