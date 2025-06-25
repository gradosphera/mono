import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { Selector, type ValueTypes, type ModelTypes } from '../../zeus/index'

// Сырой селектор для CreateWithdrawResponse
export const rawCreateWithdrawResponseSelector = {
  withdraw_hash: true,
}

// Валидация селектора
const _validate: MakeAllFieldsRequired<ValueTypes['CreateWithdrawResponse']> = rawCreateWithdrawResponseSelector

/**
 * Селектор для ответа создания заявки на вывод средств
 */
export const createWithdrawResponseSelector = Selector('CreateWithdrawResponse')(rawCreateWithdrawResponseSelector)

export type CreateWithdrawResponseType = ModelTypes['CreateWithdrawResponse'] 