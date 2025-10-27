import { rawContributorSelector, rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalEditContributor'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'EditContributorInput!') }, rawContributorSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['EditContributorInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
