import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'voteOnAnnualGeneralMeet'

/**
 * Голосование на общем собрании пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'VoteOnAnnualGeneralMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['VoteOnAnnualGeneralMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
