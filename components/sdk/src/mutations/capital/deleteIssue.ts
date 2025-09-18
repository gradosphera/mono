import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalDeleteIssue'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeleteCapitalIssueByHashInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeleteCapitalIssueByHashInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
