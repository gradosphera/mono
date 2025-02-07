import { returnByAssetActDocumentSelector } from '../../selectors/cooplace'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'generateReturnByAssetAct'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ReturnByAssetActGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, returnByAssetActDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ReturnByAssetActGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
