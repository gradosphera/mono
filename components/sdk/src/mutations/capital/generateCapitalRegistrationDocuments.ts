import { generateCapitalRegistrationDocumentsOutputSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalGenerateRegistrationDocuments'

export const mutation = Selector('Mutation')({
  [name]: [
    { data: $('data', 'GenerateCapitalRegistrationDocumentsInputDTO!') },
    generateCapitalRegistrationDocumentsOutputSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GenerateCapitalRegistrationDocumentsInputDTO']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
