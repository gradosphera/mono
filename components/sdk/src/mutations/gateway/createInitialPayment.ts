import { paymentSelector } from '../../selectors/gateway/paymentSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createInitialPayment'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateInitialPaymentInput!') }, paymentSelector],
})

export interface IInput {
  data: ModelTypes['CreateInitialPaymentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation> 