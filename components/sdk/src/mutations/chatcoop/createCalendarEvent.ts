import { chatCoopCalendarEventSelector } from '../../selectors/chatcoop'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopCreateCalendarEvent'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateChatCoopCalendarEventInput!') }, chatCoopCalendarEventSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateChatCoopCalendarEventInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
