import { createWithdrawResponseSelector } from '../../selectors/wallet/createWithdrawResponseSelector'
import { $, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createWithdraw'

// Селектор мутации
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateWithdrawInput!') }, createWithdrawResponseSelector],
})

// Интерфейс для входных данных
export interface IInput {
  data: ModelTypes['CreateWithdrawInput']
}

// Тип выходных данных
export interface IOutput {
  [name]: ModelTypes['CreateWithdrawResponse']
}
