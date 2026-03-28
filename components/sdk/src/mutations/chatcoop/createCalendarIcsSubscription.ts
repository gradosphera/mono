import { chatCoopCalendarIcsUrlSelector } from '../../selectors/chatcoop'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'chatcoopCreateCalendarIcsSubscription'

export const mutation = Selector('Mutation')({
  [name]: chatCoopCalendarIcsUrlSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
