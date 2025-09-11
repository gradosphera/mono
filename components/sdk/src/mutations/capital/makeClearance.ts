import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalMakeClearance'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'MakeClearanceInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['MakeClearanceInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
