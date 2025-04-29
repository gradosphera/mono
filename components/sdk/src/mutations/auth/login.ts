import { registeredAccountSelector } from '../../selectors/accounts/registeredAccountSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'login'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'LoginInput!') }, registeredAccountSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['LoginInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
