import { voteSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalVote'

/**
 * Получение голоса по ID
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetVoteInput!') }, voteSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetVoteInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
