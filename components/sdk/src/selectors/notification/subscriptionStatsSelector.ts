import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

// Селектор для SubscriptionStatsDto
const rawSubscriptionStatsSelector = {
  total: true,
  active: true,
  inactive: true,
  uniqueUsers: true,
}

// Проверка валидности SubscriptionStatsDto
const _validate: MakeAllFieldsRequired<ValueTypes['SubscriptionStatsDto']> = rawSubscriptionStatsSelector

export type subscriptionStatsModel = ModelTypes['SubscriptionStatsDto']
export const subscriptionStatsSelector = Selector('SubscriptionStatsDto')(rawSubscriptionStatsSelector)
export { rawSubscriptionStatsSelector }
