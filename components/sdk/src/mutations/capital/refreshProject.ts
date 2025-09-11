import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalRefreshProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'RefreshProjectInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['RefreshProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
