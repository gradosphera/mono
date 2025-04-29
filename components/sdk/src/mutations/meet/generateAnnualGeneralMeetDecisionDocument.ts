import { documentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateAnnualGeneralMeetDecisionDocument'

/**
 * Генерация документа решения годового общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [
    {
      data: $('data', 'AnnualGeneralMeetingDecisionGenerateDocumentInput!'),
      options: $('options', 'GenerateDocumentOptionsInput'),
    },
    documentSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AnnualGeneralMeetingDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
