import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopGetMaxOriginServerTsForRoom'

export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetMaxOriginServerTsForRoomInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetMaxOriginServerTsForRoomInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
