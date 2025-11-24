import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'coopgramCreateAccount'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CreateMatrixAccountInputDTO!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CreateMatrixAccountInputDTO']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
