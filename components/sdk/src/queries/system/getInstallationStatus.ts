import { installationStatusSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'getInstallationStatus'

export const query = Selector('Query')({
  [name]: [{ data: $('data', 'GetInstallationStatusInput!') }, installationStatusSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GetInstallationStatusInput']
}

export type IOutput = InputType<GraphQLTypes['Query'], typeof query>
