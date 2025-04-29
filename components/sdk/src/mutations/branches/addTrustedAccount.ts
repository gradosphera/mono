import { type branchModel, branchSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'addTrustedAccount'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'AddTrustedAccountInput!') }, branchSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['AddTrustedAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
