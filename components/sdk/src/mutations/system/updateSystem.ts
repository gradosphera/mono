import { systemInfoSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'updateSystem'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'Update!') }, systemInfoSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['Update']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
