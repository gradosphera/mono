import { rawIssueSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCreateIssue'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateIssueInput!') }, rawIssueSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateIssueInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
