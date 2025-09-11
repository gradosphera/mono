import { rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalConvertSegment'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'ConvertSegmentInput!') }, rawTransactionSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ConvertSegmentInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
