import { $, Selector, type ModelTypes } from '../../zeus/index'
import { createWithdrawResponseSelector } from '../../selectors/wallet/createWithdrawResponseSelector'

export const name = 'createWithdraw'

// Селектор мутации
export const mutation = Selector('Mutation')({
  [name]: [{ input: $('input', 'CreateWithdrawInput!') }, createWithdrawResponseSelector],
})

// Интерфейс для входных данных
export interface IInput {
  input: ModelTypes['CreateWithdrawInput']
}

// Тип выходных данных
export type IOutput = {
  [name]: ModelTypes['CreateWithdrawResponse']
}
