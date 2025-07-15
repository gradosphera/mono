import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

// Селектор для WebPushSubscriptionDto
const rawWebPushSubscriptionSelector = {
  id: true,
  username: true,
  endpoint: true,
  p256dhKey: true,
  authKey: true,
  userAgent: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}

// Проверка валидности WebPushSubscriptionDto
const _validate: MakeAllFieldsRequired<ValueTypes['WebPushSubscriptionDto']> = rawWebPushSubscriptionSelector

export type webPushSubscriptionModel = ModelTypes['WebPushSubscriptionDto']
export const webPushSubscriptionSelector = Selector('WebPushSubscriptionDto')(rawWebPushSubscriptionSelector)
export { rawWebPushSubscriptionSelector }
