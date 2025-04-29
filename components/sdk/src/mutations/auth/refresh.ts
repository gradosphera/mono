import { registeredAccountSelector } from '../../selectors/accounts/registeredAccountSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'refresh'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'RefreshInput!') }, registeredAccountSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['RefreshInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
