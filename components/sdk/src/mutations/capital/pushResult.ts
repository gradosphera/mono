import { rawSegmentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalPushResult'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'PushResultInput!') }, rawSegmentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['PushResultInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
