import { rawCommitSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateCommit'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateCommitInput!') }, rawCommitSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateCommitInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
