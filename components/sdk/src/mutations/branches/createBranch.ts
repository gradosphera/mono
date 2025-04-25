import { type branchModel, branchSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'createBranch'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateBranchInput!') }, branchSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateBranchInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
