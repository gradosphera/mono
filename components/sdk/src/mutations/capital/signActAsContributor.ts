import { rawSegmentSelector, rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSignActAsContributor'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SignActAsContributorInput!') }, rawSegmentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SignActAsContributorInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
