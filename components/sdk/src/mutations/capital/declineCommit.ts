import { rawCommitSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalDeclineCommit'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CommitDeclineInput!') }, rawCommitSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CommitDeclineInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
