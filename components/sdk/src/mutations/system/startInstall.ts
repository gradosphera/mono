import { systemInfoSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'startInstall'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'StartInstallInput!') }, {
    install_code: true,
    coopname: true,
  }],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['StartInstallInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
