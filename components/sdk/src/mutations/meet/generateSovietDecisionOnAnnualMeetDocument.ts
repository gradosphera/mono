import { documentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateSovietDecisionOnAnnualMeetDocument'

/**
 * Генерация документа решения совета о проведении годового общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [{
    data: $('data', 'AnnualGeneralMeetingSovietDecisionGenerateDocumentInput!'),
    options: $('options', 'GenerateDocumentOptionsInput'),
  }, documentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AnnualGeneralMeetingSovietDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
