import { paymentSelector } from '../../selectors/payments'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createInitialPayment'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateInitialPaymentInput!') }, paymentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateInitialPaymentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
