import { rawTriggerNotificationWorkflowResultSelector } from '../../selectors/notification/triggerNotificationWorkflowResultSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'triggerNotificationWorkflow'

/**
 * Запустить воркфлоу уведомлений
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'TriggerNotificationWorkflowInput!') }, rawTriggerNotificationWorkflowResultSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['TriggerNotificationWorkflowInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
