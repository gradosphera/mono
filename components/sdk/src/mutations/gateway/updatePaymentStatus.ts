import { $, Selector, type ModelTypes } from '../../zeus/index'
import { outgoingPaymentSelector } from '../../selectors/gateway/outgoingPaymentSelector'

export const name = 'updatePaymentStatus'

// Селектор мутации
export const mutation = Selector('Mutation')({
  [name]: [{ input: $('input', 'UpdatePaymentStatusInput!') }, outgoingPaymentSelector],
})

// Интерфейс для входных данных
export interface IInput {
  input: ModelTypes['UpdatePaymentStatusInput']
}

// Тип выходных данных
export type IOutput = {
  [name]: ModelTypes['OutgoingPayment']
}
