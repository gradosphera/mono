import { returnByAssetDecisionDocumentSelector } from '../../selectors/cooplace'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateReturnByAssetDecision'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ReturnByAssetDecisionGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, returnByAssetDecisionDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ReturnByAssetDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
