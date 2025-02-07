import { documentSelector } from '../../selectors'
import { assetContributionStatementDocumentSelector } from '../../selectors/cooplace'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus'

export const name = 'generateAssetContributionStatement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AssetContributionStatementGenerateDocumentInput!'), options: $('options', 'GenerateDocumentOptionsInput') }, assetContributionStatementDocumentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AssetContributionStatementGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
