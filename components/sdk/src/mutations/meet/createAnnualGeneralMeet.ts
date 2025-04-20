import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createAnnualGeneralMeet'

/**
 * Сгенерировать документ предложения повестки очередного общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateAnnualGeneralMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateAnnualGeneralMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
