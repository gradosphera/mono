import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

// Селектор для TriggerNotificationWorkflowResult
const rawTriggerNotificationWorkflowResultSelector = {
  transactionId: true,
  acknowledged: true,
  status: true,
  error: true,
}

// Проверка валидности TriggerNotificationWorkflowResult
const _validate: MakeAllFieldsRequired<ValueTypes['TriggerNotificationWorkflowResult']> = rawTriggerNotificationWorkflowResultSelector

export type triggerNotificationWorkflowResultModel = ModelTypes['TriggerNotificationWorkflowResult']
export const triggerNotificationWorkflowResultSelector = Selector('TriggerNotificationWorkflowResult')(rawTriggerNotificationWorkflowResultSelector)
export { rawTriggerNotificationWorkflowResultSelector }
