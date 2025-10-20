import { rawSegmentSelector, rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCalculateVotes'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CalculateVotesInput!') }, rawSegmentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CalculateVotesInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
