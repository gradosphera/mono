import { paymentSelector } from '../../selectors/payments'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'setPaymentStatus'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SetPaymentStatusInput!') }, paymentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SetPaymentStatusInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
