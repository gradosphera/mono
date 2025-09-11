import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSetConfig'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SetConfigInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SetConfigInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
