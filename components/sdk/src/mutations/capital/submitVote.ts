import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSubmitVote'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SubmitVoteInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SubmitVoteInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
