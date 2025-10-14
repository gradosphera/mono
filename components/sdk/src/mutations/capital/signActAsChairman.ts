import { rawSegmentSelector, rawTransactionSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalSignActAsChairman'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SignActAsChairmanInput!') }, rawSegmentSelector],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SignActAsChairmanInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
