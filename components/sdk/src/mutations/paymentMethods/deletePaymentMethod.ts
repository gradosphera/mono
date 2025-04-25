import { paymentMethodSelector } from '../../selectors/paymentMethods/paymentMethodSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'deletePaymentMethod'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeletePaymentMethodInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeletePaymentMethodInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
