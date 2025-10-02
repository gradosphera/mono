import { projectSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalCloseProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'CloseProjectInput!') }, projectSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['CloseProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
