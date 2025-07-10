import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'
import { rawWebPushSubscriptionSelector } from './webPushSubscriptionSelector'

// Селектор для CreateSubscriptionResponse
const rawCreateSubscriptionResponseSelector = {
  success: true,
  message: true,
  subscription: rawWebPushSubscriptionSelector,
}

// Проверка валидности CreateSubscriptionResponse
const _validate: MakeAllFieldsRequired<ValueTypes['CreateSubscriptionResponse']> = rawCreateSubscriptionResponseSelector

export type createSubscriptionResponseModel = ModelTypes['CreateSubscriptionResponse']
export const createSubscriptionResponseSelector = Selector('CreateSubscriptionResponse')(rawCreateSubscriptionResponseSelector)
export { rawCreateSubscriptionResponseSelector }
