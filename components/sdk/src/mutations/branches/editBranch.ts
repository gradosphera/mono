import { type branchModel, branchSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'editBranch'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'EditBranchInput!') }, branchSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['EditBranchInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
