import { documentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalGenerateAppendixGenerationAgreement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AppendixGenerationAgreementGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, documentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AppendixGenerationAgreementGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
