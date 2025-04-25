import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'setWif'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'Update!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SetWifInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
