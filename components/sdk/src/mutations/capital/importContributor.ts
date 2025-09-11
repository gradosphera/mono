import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalImportContributor'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ImportContributorInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ImportContributorInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
