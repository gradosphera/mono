import { documentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateConvertToAxonStatement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ConvertToAxonStatementGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, documentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ConvertToAxonStatementGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
