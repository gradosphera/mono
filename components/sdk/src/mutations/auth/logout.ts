import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'logout'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'LogoutInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['LogoutInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
