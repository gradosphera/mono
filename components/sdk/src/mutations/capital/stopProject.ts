import { projectSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalStopProject'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'StopProjectInput!') }, projectSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['StopProjectInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
