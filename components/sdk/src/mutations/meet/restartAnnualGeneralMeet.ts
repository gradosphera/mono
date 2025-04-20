import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'restartAnnualGeneralMeet'

/**
 * Перезапуск годового общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'RestartAnnualGeneralMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['RestartAnnualGeneralMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
