import { paymentSelector } from '../../selectors/gateway/paymentSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createDepositPayment'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateDepositPaymentInput!') }, paymentSelector],
})

export interface IInput {
  data: ModelTypes['CreateDepositPaymentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation> 