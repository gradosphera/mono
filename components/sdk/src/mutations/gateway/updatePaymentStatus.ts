import { $, Selector, type ModelTypes } from '../../zeus/index'
import { paymentSelector } from '../../selectors/gateway/paymentSelector'

export const name = 'setPaymentStatus'

// Селектор мутации
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SetPaymentStatusInput!') }, paymentSelector],
})

// Интерфейс для входных данных
export interface IInput {
  data: ModelTypes['SetPaymentStatusInput']
}

// Тип выходных данных
export type IOutput = {
  [name]: ModelTypes['GatewayPayment']
}
