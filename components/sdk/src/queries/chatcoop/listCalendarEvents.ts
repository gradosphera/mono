import { chatCoopCalendarEventSelector } from '../../selectors/chatcoop'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'chatcoopListCalendarEvents'

export const query = Selector('Query')({
  [name]: chatCoopCalendarEventSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
