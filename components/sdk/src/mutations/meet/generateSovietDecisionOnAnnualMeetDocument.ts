import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateSovietDecisionOnAnnualMeetDocument'

/**
 * Генерация документа решения совета о проведении годового общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'GenerateSovietDecisionOnAnnualMeetInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GenerateSovietDecisionOnAnnualMeetInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
