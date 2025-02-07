import { returnByAssetStatementDocumentSelector } from '../../selectors/cooplace'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'generateReturnByAssetStatement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ReturnByAssetStatementGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, returnByAssetStatementDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ReturnByAssetStatementGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
