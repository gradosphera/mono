import { paymentSelector } from '../../selectors/payments'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createDepositPayment'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateDepositPaymentInput!') }, paymentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateDepositPaymentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
