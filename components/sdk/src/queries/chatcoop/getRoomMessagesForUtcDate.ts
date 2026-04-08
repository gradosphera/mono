import { rawChatcoopRoomMessageLineSelector } from '../../selectors/chatcoop/projectCommunication'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopGetRoomMessagesForUtcDate'

export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetRoomMessagesForUtcDateInput!') }, rawChatcoopRoomMessageLineSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetRoomMessagesForUtcDateInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
