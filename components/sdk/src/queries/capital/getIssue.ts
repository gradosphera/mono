import { issueSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalIssue'

/**
 * Получение задачи по HASH
 */
export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetCapitalIssueByHashInput!') }, issueSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetCapitalIssueByHashInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
