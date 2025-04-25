import { accountSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'updateAccount'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UpdateAccountInput!') }, accountSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UpdateAccountInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
