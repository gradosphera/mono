import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSetMaster'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SetMasterInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SetMasterInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
