import { rawIssueSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalMoveIssueToComponent'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'MoveCapitalIssueToComponentInput!') }, rawIssueSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['MoveCapitalIssueToComponentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
