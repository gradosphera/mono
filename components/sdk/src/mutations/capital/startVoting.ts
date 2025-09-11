import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalStartVoting'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'StartVotingInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['StartVotingInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
