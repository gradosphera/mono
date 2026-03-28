import { chatCoopCalendarEventSelector } from '../../selectors/chatcoop'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'chatcoopUpdateCalendarEvent'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UpdateChatCoopCalendarEventInput!') }, chatCoopCalendarEventSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UpdateChatCoopCalendarEventInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
