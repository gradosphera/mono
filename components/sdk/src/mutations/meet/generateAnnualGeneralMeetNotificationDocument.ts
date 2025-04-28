import { documentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateAnnualGeneralMeetNotificationDocument'

/**
 * Генерация документа уведомления о проведении годового общего собрания пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [
    {
      data: $('data', 'AnnualGeneralMeetingNotificationGenerateDocumentInput!'),
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

  data: ModelTypes['AnnualGeneralMeetingNotificationGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
