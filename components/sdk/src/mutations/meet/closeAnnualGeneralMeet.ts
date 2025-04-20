import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'closeAnnualGeneralMeet'

/**
 * Закрытие годового общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CloseAnnualGeneralMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CloseAnnualGeneralMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
