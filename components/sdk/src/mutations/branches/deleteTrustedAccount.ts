import { type branchModel, branchSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'deleteTrustedAccount'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'DeleteTrustedAccountInput!') }, branchSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['DeleteTrustedAccountInput']
}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
