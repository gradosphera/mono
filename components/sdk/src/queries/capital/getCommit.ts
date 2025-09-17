import { commitSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCommit'

/**
 * Получение коммита по HASH
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetCapitalCommitByHashInput!') }, commitSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetCapitalCommitByHashInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
