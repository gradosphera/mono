import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'signByPresiderOnAnnualGeneralMeet'

/**
 * Подписание решения председателем на годовом общем собрании пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SignByPresiderOnAnnualGeneralMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SignByPresiderOnAnnualGeneralMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
