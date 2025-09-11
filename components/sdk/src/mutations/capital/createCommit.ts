import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateCommit'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateCommitInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateCommitInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
