import { rawSettingsSelector } from '../../selectors/system/systemInfoSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'updateSettings'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'UpdateSettingsInput!') }, rawSettingsSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['UpdateSettingsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
