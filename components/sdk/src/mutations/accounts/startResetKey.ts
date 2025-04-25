import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'startResetKey'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'StartResetKeyInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['StartResetKeyInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
