import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'uninstallExtension'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UninstallExtensionInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UninstallExtensionInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
