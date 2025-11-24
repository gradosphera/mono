import { coopgramAccountStatusSelector } from '../../selectors/coopgram'
import { type GraphQLTypes, type InputType, Selector } from '../../zeus/index'

export const name = 'coopgramGetAccountStatus'

export const query = Selector('Query')({
  [name]: coopgramAccountStatusSelector,
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
