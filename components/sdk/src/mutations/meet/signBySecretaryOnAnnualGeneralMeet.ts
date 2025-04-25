import { meetAggregateSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'signBySecretaryOnAnnualGeneralMeet'

/**
 * Подписание решения секретарём на годовом общем собрании пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SignBySecretaryOnAnnualGeneralMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SignBySecretaryOnAnnualGeneralMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
