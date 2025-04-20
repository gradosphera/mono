import { meetAggregateSelector } from '../../selectors/meet'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateAnnualGeneralMeetAgendaDocument'

/**
 * Генерация документа повестки годового общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AnnualGeneralMeetingAgendaGenerateDocumentInput!') }, meetAggregateSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AnnualGeneralMeetingAgendaGenerateDocumentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
