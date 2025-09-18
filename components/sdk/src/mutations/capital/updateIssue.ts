import { rawIssueSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalUpdateIssue'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UpdateIssueInput!') }, rawIssueSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UpdateIssueInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
