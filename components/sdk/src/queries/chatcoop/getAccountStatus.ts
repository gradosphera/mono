import { chatcoopAccountStatusSelector } from '../../selectors/chatcoop'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'chatcoopGetAccountStatus'

export const query = Selector('Query')({
  [name]: chatcoopAccountStatusSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
