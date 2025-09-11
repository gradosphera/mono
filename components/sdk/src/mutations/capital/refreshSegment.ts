import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalRefreshSegment'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'RefreshSegmentInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['RefreshSegmentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
