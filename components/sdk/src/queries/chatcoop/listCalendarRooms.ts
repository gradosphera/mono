import { chatCoopCalendarRoomOptionSelector } from '../../selectors/chatcoop'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'chatcoopListCalendarRooms'

export const query = Selector('Query')({
  [name]: chatCoopCalendarRoomOptionSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
