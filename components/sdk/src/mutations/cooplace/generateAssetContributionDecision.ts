import { assetContributionDecisionDocumentSelector } from '../../selectors/cooplace'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'generateAssetContributionDecision'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AssetContributionDecisionGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, assetContributionDecisionDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AssetContributionDecisionGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
