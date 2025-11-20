import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'processConvertToAxonStatement'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ProcessConvertToAxonStatementInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ProcessConvertToAxonStatementInput']
}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
