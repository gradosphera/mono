import { rawChatcoopProjectCommunicationRoomSelector } from '../../selectors/chatcoop/projectCommunication'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopListProjectCommunicationRooms'

export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetProjectCommunicationRoomsInput!') }, rawChatcoopProjectCommunicationRoomSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetProjectCommunicationRoomsInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
