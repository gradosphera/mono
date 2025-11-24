import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopCheckUsernameAvailability'

export const query = Selector('Query')({
  [name]: [{ data: $('data', 'CheckMatrixUsernameInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CheckMatrixUsernameInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
