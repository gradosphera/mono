import { assetContributionActDocumentSelector } from '../../selectors/cooplace'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'generateAssetContributionAct'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AssetContributionActGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, assetContributionActDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AssetContributionActGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
